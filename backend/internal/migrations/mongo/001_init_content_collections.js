const currentDb = db;

async function ensureCollection(name) {
  const exists = currentDb.getCollectionInfos({ name }).length > 0;
  if (!exists) {
    await currentDb.createCollection(name);
  }
}

async function ensureIndex(collectionName, keys, options) {
  const collection = currentDb.getCollection(collectionName);
  const indexName = options && options.name;

  if (indexName) {
    const existing = collection.getIndexes().find((index) => index.name === indexName);
    if (existing) {
      const existingKeys = JSON.stringify(existing.key);
      const expectedKeys = JSON.stringify(keys);
      if (existingKeys !== expectedKeys) {
        await collection.dropIndex(indexName);
      }
    }
  }

  await collection.createIndex(keys, options);
}

async function main() {
  const collections = [
    "note_documents",
    "note_snapshots",
    "graph_documents",
    "graph_snapshots",
    "pdf_annotation_documents",
    "material_text_documents",
    "ai_conversations",
    "ai_drafts",
    "diagram_source_documents",
    "user_workspace_states",
  ];

  for (const name of collections) {
    await ensureCollection(name);
  }

  await ensureIndex("note_documents", { note_id: 1 }, { unique: true, name: "uk_note_documents_note_id" });
  await ensureIndex("note_documents", { owner_user_id: 1, updated_at: -1 }, { name: "idx_note_documents_owner_updated_at" });
  await ensureIndex("note_documents", { material_id: 1, updated_at: -1 }, { name: "idx_note_documents_material_updated_at", sparse: true });

  await ensureIndex("note_snapshots", { note_id: 1, version: -1 }, { unique: true, name: "uk_note_snapshots_note_version" });
  await ensureIndex("note_snapshots", { note_id: 1, created_at: -1 }, { name: "idx_note_snapshots_note_created_at" });

  await ensureIndex("graph_documents", { graph_id: 1 }, { unique: true, name: "uk_graph_documents_graph_id" });
  await ensureIndex("graph_documents", { owner_user_id: 1, updated_at: -1 }, { name: "idx_graph_documents_owner_updated_at" });

  await ensureIndex("graph_snapshots", { graph_id: 1, version: -1 }, { unique: true, name: "uk_graph_snapshots_graph_version" });
  await ensureIndex("graph_snapshots", { graph_id: 1, created_at: -1 }, { name: "idx_graph_snapshots_graph_created_at" });

  await ensureIndex("pdf_annotation_documents", { annotation_id: 1 }, { unique: true, name: "uk_pdf_annotation_documents_annotation_id" });
  await ensureIndex("pdf_annotation_documents", { material_id: 1, page: 1 }, { name: "idx_pdf_annotation_documents_material_page" });
  await ensureIndex("pdf_annotation_documents", { user_id: 1, material_id: 1, updated_at: -1 }, { name: "idx_pdf_annotation_documents_user_material_updated_at" });

  await ensureIndex("material_text_documents", { material_id: 1 }, { unique: true, name: "uk_material_text_documents_material_id" });
  await ensureIndex("material_text_documents", { search_status: 1, updated_at: -1 }, { name: "idx_material_text_documents_search_status_updated_at" });

  await ensureIndex("ai_conversations", { session_id: 1 }, { unique: true, name: "uk_ai_conversations_session_id" });
  await ensureIndex("ai_conversations", { user_id: 1, updated_at: -1 }, { name: "idx_ai_conversations_user_updated_at" });

  await ensureIndex("ai_drafts", { draft_id: 1 }, { unique: true, name: "uk_ai_drafts_draft_id" });
  await ensureIndex("ai_drafts", { target_type: 1, target_id: 1, created_at: -1 }, { name: "idx_ai_drafts_target_created_at" });

  await ensureIndex("diagram_source_documents", { source_id: 1 }, { unique: true, name: "uk_diagram_source_documents_source_id" });
  await ensureIndex("diagram_source_documents", { diagram_type: 1, updated_at: -1 }, { name: "idx_diagram_source_documents_type_updated_at" });

  await ensureIndex("user_workspace_states", { user_id: 1, workspace_key: 1 }, { unique: true, name: "uk_user_workspace_states_user_workspace" });
  await ensureIndex("user_workspace_states", { updated_at: -1 }, { name: "idx_user_workspace_states_updated_at" });

  print(`Mongo content collections initialized in database: ${currentDb.getName()}`);
}

main().catch((error) => {
  print(error && error.stack ? error.stack : error);
  quit(1);
});
