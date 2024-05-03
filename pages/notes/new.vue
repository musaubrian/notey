<script setup lang="ts">
import { ref } from "vue";
import idb from "~/idb/idb";
import {
  getNoteByID,
  insertNote,
  updateNote,
  type Note,
  type PartialNote,
} from "~/idb/store";
import { Toaster, toast } from "@steveyuowo/vue-hot-toast";
import "@steveyuowo/vue-hot-toast/vue-hot-toast.css";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.bubble.css";

const AUTO_SAVE_INTERVAL = 1000;

const title = ref("");
const content = ref("");
const openDB = ref<IDBDatabase>();
const savedID = ref("");

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  // This could be cleaner
  if (openDB.value) {
    const existingNote = await getNoteByID(openDB.value, savedID.value);
    const partial: PartialNote = {
      title: title.value,
      content: JSON.stringify(content.value),
    };

    if (existingNote) {
      const updatedNote: Note = {
        id: existingNote.id,
        title: existingNote.title,
        content: partial.content,
        created_at: existingNote.created_at,
      };
      await updateNote(openDB.value, updatedNote);
    } else {
      partial.title = generatePrettyName();
      const noteID = await insertNote(openDB.value, partial);
      if (noteID) {
        savedID.value = noteID.toString();
      }
    }
  }
};

async function handleDBInit() {
  const db = await idb.initDB();
  if (db) {
    openDB.value = db;
  }
}

const updateContent = (c: any) => {
  content.value = c;
};

onMounted(() => {
  handleDBInit();
  toast.success("Auto saving enabled", {
    duration: 1000,
  });
});
</script>
<template>
  <Toaster />
  <main class="w-full items-center flex flex-col justify-center h-[100svh]">
    <QuillEditor
      content-type="html"
      class="w-full h-5/6 text-xl"
      @update:content="(c) => updateContent(c)"
      theme="bubble"
      content="Write your story..."
      @keydown.ctrl.enter.exact="handleSubmit"
    />

    <div class="fixed bottom-0 inline-flex items-center justify-end w-full p-5">
      <NuxtLink
        to="/notes"
        class="btn bg-slate-600/50 hover:bg-slate-700 btn-circle"
      >
        back
      </NuxtLink>
    </div>
  </main>
</template>
