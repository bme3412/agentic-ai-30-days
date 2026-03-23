# A2A Google Codelab: Purchasing Concierge - Summary

> Source: [Google Codelabs - A2A Purchasing Concierge](https://codelabs.developers.google.com/intro-a2a-purchasing-concierge)

## Overview

A step-by-step tutorial building a purchasing concierge system using A2A. Demonstrates agent collaboration on Google Cloud Run with Agent Engine integration.

## What You'll Build

A multi-agent purchasing system where:
1. **Concierge Agent** - Receives user requests, coordinates other agents
2. **Product Search Agent** - Finds products matching criteria
3. **Price Comparison Agent** - Compares prices across vendors
4. **Order Agent** - Handles purchasing and order tracking

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Request                      │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              Concierge Agent (A2A)                   │
│         Orchestrates the purchasing flow             │
└────┬────────────────┬────────────────┬──────────────┘
     │                │                │
     ▼                ▼                ▼
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Product │    │  Price  │    │  Order  │
│ Search  │    │ Compare │    │ Agent   │
│ Agent   │    │ Agent   │    │         │
└─────────┘    └─────────┘    └─────────┘
```

## Prerequisites

- Google Cloud account
- gcloud CLI installed
- Python 3.9+
- Basic A2A knowledge

## Step 1: Set Up Google Cloud

```bash
# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable aiplatform.googleapis.com

# Set project
gcloud config set project YOUR_PROJECT_ID
```

## Step 2: Create the Product Search Agent

```python
# product_search/main.py
from a2a.server import A2AServer

server = A2AServer(
    name="Product Search Agent",
    skills=[{
        "id": "search",
        "name": "Product Search",
        "description": "Search products by criteria"
    }]
)

@server.on_message
async def search_products(message, ctx):
    query = extract_query(message)

    # Search product database
    products = await product_db.search(
        query=query.text,
        category=query.category,
        max_price=query.max_price
    )

    return {
        "status": {"state": "TASK_STATE_COMPLETED"},
        "artifacts": [{
            "name": "Search Results",
            "parts": [{"data": {"products": products}}]
        }]
    }
```

## Step 3: Create the Price Comparison Agent

```python
# price_compare/main.py
@server.on_message
async def compare_prices(message, ctx):
    product_id = message.parts[0].data.get("product_id")

    # Fetch prices from multiple vendors
    prices = await asyncio.gather(
        vendor_a.get_price(product_id),
        vendor_b.get_price(product_id),
        vendor_c.get_price(product_id)
    )

    best = min(prices, key=lambda p: p.price)

    return {
        "status": {"state": "TASK_STATE_COMPLETED"},
        "artifacts": [{
            "name": "Price Comparison",
            "parts": [
                {"text": f"Best price: ${best.price} at {best.vendor}"},
                {"data": {"prices": prices, "best": best}}
            ]
        }]
    }
```

## Step 4: Create the Concierge Agent

```python
# concierge/main.py
class ConciergeAgent:
    def __init__(self):
        self.search = A2AClient("https://product-search-xxx.run.app")
        self.compare = A2AClient("https://price-compare-xxx.run.app")
        self.order = A2AClient("https://order-agent-xxx.run.app")

    async def handle_request(self, message, ctx):
        intent = classify_intent(message)

        if intent == "find_product":
            # Delegate to search agent
            search_result = await self.search.send_message(message)
            return search_result

        elif intent == "compare_prices":
            product_id = extract_product_id(message)
            compare_result = await self.compare.send_message({
                "parts": [{"data": {"product_id": product_id}}]
            })
            return compare_result

        elif intent == "purchase":
            # Multi-step: search → compare → order
            products = await self.search.send_message(message)
            best_product = products.artifacts[0].parts[0].data["products"][0]

            prices = await self.compare.send_message({
                "parts": [{"data": {"product_id": best_product["id"]}}]
            })
            best_price = prices.artifacts[0].parts[0].data["best"]

            order = await self.order.send_message({
                "parts": [{
                    "data": {
                        "product": best_product,
                        "vendor": best_price["vendor"],
                        "price": best_price["price"]
                    }
                }]
            })
            return order
```

## Step 5: Deploy to Cloud Run

```bash
# Deploy each agent
cd product_search
gcloud run deploy product-search-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated

cd ../price_compare
gcloud run deploy price-compare-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated

cd ../concierge
gcloud run deploy concierge-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

## Step 6: Test the System

```python
from a2a import A2AClient

concierge = A2AClient("https://concierge-xxx.run.app")

# Test product search
response = await concierge.send_message({
    "parts": [{"text": "Find me a laptop under $1000"}]
})
print(response.task.artifacts)

# Test full purchase flow
response = await concierge.send_message({
    "parts": [{"text": "Buy the best deal on AirPods Pro"}]
})
print(response.task.artifacts)
```

## Key Learnings

1. **Agent Card Discovery** - Each agent exposes capabilities via standard endpoint
2. **Task Delegation** - Concierge orchestrates by calling other agents
3. **Context Passing** - Data flows between agents via message parts
4. **Error Handling** - Each agent handles failures independently
5. **Scaling** - Cloud Run auto-scales each agent independently

## Cleanup

```bash
gcloud run services delete product-search-agent
gcloud run services delete price-compare-agent
gcloud run services delete concierge-agent
```

## Next Steps

- Add authentication between agents
- Implement caching for price comparisons
- Add monitoring with Cloud Trace
- Integrate with Agent Engine for enhanced orchestration
