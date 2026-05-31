const currentDb = db;

async function main() {
  const collections = [
    "user_workspace_states",
    "diagram_source_documents",
    "ai_drafts",
    "ai_conversations",
    "material_text_documents",
    "pdf_annotation_documents",
    "graph_snapshots",
    "graph_documents",
    "note_snapshots",
    "note_documents",
  ];

  for (const name of collections) {
    if (currentDb.getCollectionInfos({ name }).length > 0) {
      await currentDb.getCollection(name).drop();
    }
  }

  print(`Mongo content collections dropped from database: ${currentDb.getName()}`);
}

main().catch((error) => {
  print(error && error.stack ? error.stack : error);
  quit(1);
});
