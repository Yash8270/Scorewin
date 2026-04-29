import json
import random
from collections import Counter
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.draw import Draw, DrawType, DrawStatus
from app.models.winner import Winner, WinnerStatus
from app.models.score import Score
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.user_charity import UserCharity
from app.services.score_service import get_latest_scores_for_user

PRIZE_TIERS = {5: 0.40, 4: 0.35, 3: 0.25}


def _calculate_prize_pool(db: Session) -> float:
    now = datetime.now(timezone.utc)
    active_subs = db.query(Subscription).filter(
        Subscription.status == SubscriptionStatus.active,
        Subscription.end_date >= now
    ).all()
    total_revenue = sum(s.amount for s in active_subs)
    total_charity = 0.0
    for sub in active_subs:
        uc = db.query(UserCharity).filter(UserCharity.user_id == sub.user_id).first()
        charity_pct = uc.percentage if uc else 10.0
        total_charity += sub.amount * (charity_pct / 100.0)
    return max(total_revenue - total_charity, 0.0)


def _get_previous_jackpot_rollover(db: Session) -> float:
    last_draw = db.query(Draw).filter(
        Draw.status == DrawStatus.published
    ).order_by(Draw.created_at.desc()).first()
    if last_draw:
        five_match = db.query(Winner).filter(
            Winner.draw_id == last_draw.id, Winner.match_type == 5
        ).count()
        if five_match == 0:
            return last_draw.jackpot_rollover + (last_draw.prize_pool * PRIZE_TIERS[5])
    return 0.0


def _generate_random_numbers() -> list:
    return sorted(random.sample(range(1, 46), 5))


def _generate_algorithm_numbers(db: Session) -> list:
    all_scores = db.query(Score.score).all()
    if len(all_scores) < 5:
        return _generate_random_numbers()
    score_values = [s[0] for s in all_scores]
    freq = Counter(score_values)
    weighted_pool = []
    for score_val in range(1, 46):
        weight = freq.get(score_val, 1)
        weighted_pool.extend([score_val] * weight)
    selected = set()
    while len(selected) < 5:
        selected.add(random.choice(weighted_pool))
    return sorted(list(selected))


def _find_matches(user_scores: list, draw_numbers: list) -> int:
    return len(set(user_scores) & set(draw_numbers))


def _get_eligible_users(db: Session) -> list:
    now = datetime.now(timezone.utc)
    active_subs = db.query(Subscription).filter(
        Subscription.status == SubscriptionStatus.active,
        Subscription.end_date >= now
    ).all()
    eligible = []
    for sub in active_subs:
        scores = get_latest_scores_for_user(db, sub.user_id, 5)
        if len(scores) >= 3:
            eligible.append({"user_id": sub.user_id, "scores": scores})
    return eligible


def simulate_draw(db: Session, draw_type: str) -> dict:
    prize_pool = _calculate_prize_pool(db)
    jackpot_rollover = _get_previous_jackpot_rollover(db)
    numbers = _generate_random_numbers() if draw_type == DrawType.random else _generate_algorithm_numbers(db)
    eligible_users = _get_eligible_users(db)
    potential_winners = []
    for user_info in eligible_users:
        mc = _find_matches(user_info["scores"], numbers)
        if mc >= 3:
            potential_winners.append({"user_id": user_info["user_id"], "match_type": mc, "scores": user_info["scores"]})
    return {"numbers": numbers, "draw_type": draw_type, "prize_pool": prize_pool, "potential_winners": potential_winners, "jackpot_rollover": jackpot_rollover}


def run_draw(db: Session, draw_type: str) -> Draw:
    now = datetime.now(timezone.utc)
    month = now.strftime("%Y-%m")
    prize_pool = _calculate_prize_pool(db)
    jackpot_rollover = _get_previous_jackpot_rollover(db)
    numbers = _generate_random_numbers() if draw_type == DrawType.random else _generate_algorithm_numbers(db)
    draw = Draw(month=month, numbers=json.dumps(numbers), draw_type=draw_type, status=DrawStatus.simulated, prize_pool=prize_pool, jackpot_rollover=jackpot_rollover)
    db.add(draw)
    db.commit()
    db.refresh(draw)
    eligible_users = _get_eligible_users(db)
    tier_winners = {5: [], 4: [], 3: []}
    for user_info in eligible_users:
        mc = _find_matches(user_info["scores"], numbers)
        if mc >= 3:
            tier_winners[mc].append(user_info["user_id"])
    total_pool = prize_pool + jackpot_rollover
    for tier, user_ids in tier_winners.items():
        if not user_ids:
            continue
        tier_pool = total_pool * PRIZE_TIERS[tier]
        per_winner = tier_pool / len(user_ids)
        for uid in user_ids:
            winner = Winner(user_id=uid, draw_id=draw.id, match_type=tier, amount=round(per_winner, 2), status=WinnerStatus.pending)
            db.add(winner)
    if not tier_winners[5]:
        draw.jackpot_rollover = jackpot_rollover + (prize_pool * PRIZE_TIERS[5])
    else:
        draw.jackpot_rollover = 0.0
    db.commit()
    db.refresh(draw)
    return draw


def publish_draw(db: Session, draw_id: int) -> Draw:
    draw = db.query(Draw).filter(Draw.id == draw_id).first()
    if not draw:
        raise HTTPException(status_code=404, detail="Draw not found")
    if draw.status == DrawStatus.published:
        raise HTTPException(status_code=400, detail="Draw already published")
    draw.status = DrawStatus.published
    db.commit()
    db.refresh(draw)
    return draw


def get_all_draws(db: Session, skip: int = 0, limit: int = 50):
    return db.query(Draw).order_by(Draw.created_at.desc()).offset(skip).limit(limit).all()


def get_draw_by_id(db: Session, draw_id: int):
    draw = db.query(Draw).filter(Draw.id == draw_id).first()
    if not draw:
        raise HTTPException(status_code=404, detail="Draw not found")
    return draw


def get_draw_results(db: Session, draw_id: int) -> dict:
    draw = get_draw_by_id(db, draw_id)
    winners = db.query(Winner).filter(Winner.draw_id == draw_id).all()
    winner_list = [{"id": w.id, "user_id": w.user_id, "match_type": w.match_type, "amount": w.amount, "status": w.status.value} for w in winners]
    return {"draw": draw, "winners": winner_list}
