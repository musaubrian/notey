<template>
  <Toaster />

  <div v-if="note" class="w-full p-3 flex flex-col items-center justify-center">
    <span class="text-sm italic p-3"
      ><strong>Crafted on: </strong>
      {{ dayjs(note.created_at).format("YYYY MMM DD, h:mm A") }}</span
    >
    <div
      v-html="noteContent"
      class="w-full md:w-4/6 p-3 flex flex-col items-center justify-center"
    ></div>
    <div class="inline-flex my-20 w-full md:w-3/6 items-center justify-center">
      <NuxtLink
        to="/notes"
        class="text-blue-400 text-xl hover:underline font-semibold transition-all hover:text-blue-400/70"
        >Back home</NuxtLink
      >
    </div>

    <div class="fixed bottom-0 inline-flex items-center justify-end w-full p-5">
      <NuxtLink
        to="/notes/new"
        class="btn bg-slate-600/50 hover:bg-slate-700 btn-circle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-6 text-slate-200 h-6"
        >
          <path
            d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"
          />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import idb from "~/idb/idb";
import dayjs from "dayjs";
import { getNoteByID, type Note } from "~/idb/store";
import { Toaster, toast } from "@steveyuowo/vue-hot-toast";
import "@steveyuowo/vue-hot-toast/vue-hot-toast.css";

const params = useRoute().params;

const note = ref<Note | null>(null);
const noteContent = ref("");
let openDB = ref<IDBDatabase | null>(null);

const handleInitDB = async () => {
  const db = await idb.initDB();
  if (db) {
    openDB.value = db;
    if (typeof params.id === "string") {
      loadNote(db, params.id);
    } else {
      toast.error("Welp");
    }
  } else {
    toast.error("could not open DB");
  }
};
const loadNote = async (db: IDBDatabase, id: string) => {
  const res = await getNoteByID(db, id);
  if (res) {
    note.value = res;
    noteContent.value = prettifyHTML(note.value.content);
  } else {
    navigateTo("/notes?error=note doesn't exist");
  }
};

onMounted(() => {
  handleInitDB();
});
</script>
