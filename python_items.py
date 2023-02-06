from fastapi import FastAPI

app = FastAPI()

items = []

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    item = [item for item in items if item["id"] == item_id]
    if item:
        return {"item": item[0]}
    return {"item": None}

@app.put("/items/{item_id}")
async def update_item(item_id: int, item: dict):
    item_to_update = [item for item in items if item["id"] == item_id]
    if item_to_update:
        item_to_update[0].update(item)
        return {"item": item_to_update[0]}
    return {"item": None}

@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    item = [item for item in items if item["id"] == item_id]
    if item:
        items.remove(item[0])
        return {"message": "Item deleted"}
    return {"message": "Item not found"}

@app.post("/items/")
async def create_item(item: dict):
    item_id = len(items) + 1
    item.update({"id": item_id})
    items.append(item)
    return {"item": item, "message": "Item created"}
