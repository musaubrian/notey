<script setup lang="ts">
import { ref } from "vue";
import idb from "~/idb/idb";
import { insertNote, type PartialNote } from "~/idb/store";
import { Toaster, toast } from "@steveyuowo/vue-hot-toast";
import "@steveyuowo/vue-hot-toast/vue-hot-toast.css";

const title = ref("");
const content = ref("");
const openDB = ref<IDBDatabase>();
const handleSubmit = async (e: Event) => {
  e.preventDefault();
  const partial: PartialNote = {
    title: title.value,
    content: content.value,
  };
  if (openDB.value) {
    const success = await insertNote(openDB.value, partial);
    if (success) {
      toast.success("Added new note");
      navigateTo("/notes")
    }
  }
};

async function handleDBInit() {
  const db = await idb.initDB();
  if (db) {
    openDB.value = db;
  }
}

onMounted(() => {
  handleDBInit();
});
</script>
<template>
  <Toaster />
  <main class="w-full items-center flex flex-col justify-center h-[100svh]">
    <form @submit="handleSubmit" class="flex-col flex w-[95%] md:w-5/12 gap-4">
      <input
        v-model.trim="title"
        required
        class="input input-bordered w-full"
        type="text"
        placeholder="today was okay"
      />
      <textarea
        required
        v-model="content"
        class="textarea textarea-bordered"
      ></textarea>
      <button class="btn btn-accent" type="submit">Add</button>
    </form>
  </main>
</template>
