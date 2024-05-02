<template>
    
    <Toaster/>
    
    <div v-if="note" class="w-full p-3 flex flex-col items-center justify-center">
    <h2 class="text-5xl font-semibold text-center capitalize my-3">{{ note.title }}</h2>
    <span class="text-sm italic">{{ dayjs(note.created_at).format("YYYY MMM DD, h:mm A") }}</span>
    <p class="p-3 text-lg text-slate-300 my-4 w-full md:w-4/6 whitespace-pre">
        {{ note.content }}
    </p>

    <div class="fixed bottom-0 inline-flex items-center justify-end w-full p-5">
      <NuxtLink to="/new" class="btn btn-circle">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </NuxtLink>
    </div>

    </div>
    
</template>
<script setup lang="ts">
import idb from "~/idb/idb";
import dayjs from "dayjs";
import { getNoteByID, type Note} from "~/idb/store";
import { Toaster, toast } from "@steveyuowo/vue-hot-toast";
import "@steveyuowo/vue-hot-toast/vue-hot-toast.css";

const params = useRoute().params;

const note = ref<Note|null>(null);

let openDB = ref<IDBDatabase | null>(null);

const handleInitDB = async () => {
  const db = await idb.initDB();
  if (db) {
    openDB.value = db;
    if (typeof(params.id) === "string"){
        loadNote(db, params.id)
    }else{
        toast.error("Welp")
    }
  } else {
    toast.error("could not open DB");
  }
};
const loadNote = async (db: IDBDatabase, id: string) => {
  const res = await getNoteByID(db, id);
  if (res) {
    note.value = res
  } else {
    navigateTo("/notes?error=note doesn't exist")
  }
};
onMounted(() => {
  handleInitDB();
});
</script>
