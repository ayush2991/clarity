import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import uuid
from datetime import datetime
from starlette.middleware.cors import CORSMiddleware # Import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class JournalEntry(BaseModel):
    id: str
    title: str
    content: str
    timestamp: datetime

# In-memory storage for journal entries
# In a real application, this would be a database
journal_entries: Dict[str, JournalEntry] = {
    "1": JournalEntry(
        id="1",
        title="My First Entry",
        content="Today was a good day. I learned about FastAPI.",
        timestamp=datetime.now()
    ),
    "2": JournalEntry(
        id="2",
        title="Thoughts on Logging",
        content="Adding logging to applications helps a lot with debugging and monitoring.",
        timestamp=datetime.now()
    ),
    "3": JournalEntry(
        id="3",
        title="Frontend Development",
        content="Building a simple frontend with HTML, CSS, and JavaScript is quite straightforward.",
        timestamp=datetime.now()
    )
}

@app.get("/entries", response_model=List[JournalEntry])
async def list_entries():
    """
    List all journal entries.
    """
    logger.info("Received request to list all journal entries.")
    return list(journal_entries.values())

@app.post("/entries", response_model=JournalEntry, status_code=201)
async def create_entry(title: str, content: str):
    """
    Create a new journal entry.
    """
    logger.info(f"Received request to create a new journal entry with title: '{title}'")
    entry_id = str(uuid.uuid4())
    new_entry = JournalEntry(
        id=entry_id,
        title=title,
        content=content,
        timestamp=datetime.now()
    )
    journal_entries[entry_id] = new_entry
    logger.info(f"Journal entry created with ID: {entry_id}")
    return new_entry

@app.get("/entries/{entry_id}", response_model=JournalEntry)
async def get_entry(entry_id: str):
    """
    Retrieve a single journal entry by its ID.
    """
    logger.info(f"Received request to retrieve journal entry with ID: {entry_id}")
    entry = journal_entries.get(entry_id)
    if not entry:
        logger.warning(f"Journal entry with ID: {entry_id} not found.")
        raise HTTPException(status_code=404, detail="Entry not found")
    logger.info(f"Successfully retrieved journal entry with ID: {entry_id}")
    return entry

@app.put("/entries/{entry_id}", response_model=JournalEntry)
async def update_entry(entry_id: str, title: str = None, content: str = None):
    """
    Update an existing journal entry.
    """
    logger.info(f"Received request to update journal entry with ID: {entry_id}")
    existing_entry = journal_entries.get(entry_id)
    if not existing_entry:
        logger.warning(f"Attempted to update non-existent journal entry with ID: {entry_id}")
        raise HTTPException(status_code=404, detail="Entry not found")

    update_data = existing_entry.model_dump()
    if title is not None:
        update_data["title"] = title
    if content is not None:
        update_data["content"] = content
    
    updated_entry = JournalEntry(**update_data)
    journal_entries[entry_id] = updated_entry
    logger.info(f"Journal entry with ID: {entry_id} updated successfully.")
    return updated_entry

@app.delete("/entries/{entry_id}", status_code=204)
async def delete_entry(entry_id: str):
    """
    Delete a journal entry by its ID.
    """
    logger.info(f"Received request to delete journal entry with ID: {entry_id}")
    if entry_id not in journal_entries:
        logger.warning(f"Attempted to delete non-existent journal entry with ID: {entry_id}")
        raise HTTPException(status_code=404, detail="Entry not found")
    del journal_entries[entry_id]
    logger.info(f"Journal entry with ID: {entry_id} deleted successfully.")
    return {"message": "Entry deleted successfully"}


