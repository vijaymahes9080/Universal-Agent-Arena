import random
import json
from sqlalchemy.orm import Session
from backend.app.db.models import Stock, Portfolio, Agent, Transaction

class StockMarketEngine:
    def __init__(self, db: Session):
        self.db = db

    def initialize_stocks_if_empty(self):
        existing = self.db.query(Stock).all()
        if existing:
            return existing
        
        agents = self.db.query(Agent).all()
        stocks = []
        for agent in agents:
            try:
                g = json.loads(agent.genome)
            except Exception:
                g = {"reasoning": 50, "coding": 50}
            
            base_price = round(50.0 + (g.get("reasoning", 50) + g.get("coding", 50)) * 0.5 + agent.reputation * 0.2, 2)
            symbol = (agent.name[:3].upper() + str(random.randint(10, 99)))
            stock = Stock(
                symbol=symbol,
                agent_uaid=agent.uaid,
                company_name=f"{agent.name} Corp",
                price=base_price,
                change_24h=round(random.uniform(-3.5, 7.5), 2),
                total_shares=10000,
                available_shares=9500,
                market_cap=round(base_price * 10000, 2)
            )
            self.db.add(stock)
            stocks.append(stock)
        self.db.commit()
        return stocks

    def execute_trade(self, trader: str, symbol: str, shares: int, action: str):
        stock = self.db.query(Stock).filter(Stock.symbol == symbol).first()
        if not stock:
            raise ValueError(f"Stock {symbol} not found.")

        total_cost = round(stock.price * shares, 2)
        portfolio = self.db.query(Portfolio).filter(
            Portfolio.trader == trader,
            Portfolio.stock_symbol == symbol
        ).first()

        if action == "buy":
            if stock.available_shares < shares:
                raise ValueError("Not enough available shares in market.")
            
            if not portfolio:
                portfolio = Portfolio(
                    trader=trader,
                    stock_symbol=symbol,
                    shares=shares,
                    avg_buy_price=stock.price
                )
                self.db.add(portfolio)
            else:
                total_existing_val = portfolio.shares * portfolio.avg_buy_price
                new_shares = portfolio.shares + shares
                portfolio.avg_buy_price = round((total_existing_val + total_cost) / new_shares, 2)
                portfolio.shares = new_shares

            stock.available_shares -= shares
            # Price impact on buy
            stock.price = round(stock.price * (1 + (shares / 20000.0)), 2)
            stock.market_cap = round(stock.price * stock.total_shares, 2)
            stock.change_24h = round(stock.change_24h + random.uniform(0.1, 1.2), 2)

        elif action == "sell":
            if not portfolio or portfolio.shares < shares:
                raise ValueError("Insufficient shares in portfolio.")

            portfolio.shares -= shares
            stock.available_shares += shares
            # Price impact on sell
            stock.price = max(1.0, round(stock.price * (1 - (shares / 25000.0)), 2))
            stock.market_cap = round(stock.price * stock.total_shares, 2)
            stock.change_24h = round(stock.change_24h - random.uniform(0.1, 1.0), 2)

        self.db.commit()
        return {
            "trader": trader,
            "symbol": symbol,
            "shares": shares,
            "action": action,
            "price": stock.price,
            "total": total_cost,
            "portfolio_shares": portfolio.shares if portfolio else 0
        }

    def launch_ipo(self, agent_uaid: str, symbol: str, company_name: str, initial_price: float):
        existing = self.db.query(Stock).filter(Stock.symbol == symbol).first()
        if existing:
            raise ValueError(f"Ticker symbol {symbol} is already registered.")

        stock = Stock(
            symbol=symbol.upper(),
            agent_uaid=agent_uaid,
            company_name=company_name,
            price=initial_price,
            change_24h=0.0,
            total_shares=10000,
            available_shares=10000,
            market_cap=round(initial_price * 10000, 2)
        )
        self.db.add(stock)
        self.db.commit()
        return stock
