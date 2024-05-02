<script setup lang="ts">
import dayjs from "dayjs";
import { onMounted, ref } from "vue";
import idb from "~/idb/idb";
import { getAllNotes, deleteNoteByID, type Note, createUser, type User, getUser } from "~/idb/store";
import { Toaster, toast } from "@steveyuowo/vue-hot-toast";
import "@steveyuowo/vue-hot-toast/vue-hot-toast.css";

const dbReady = ref(false);
const newUser = ref(false)
const isNewUser = useRoute().query.newUser
const username = ref("")


let openDB = ref<IDBDatabase | null>(null);
const notes = ref<Note[]>();

const qParams = useRoute().query;

const handleInitDB = async () => {
  const db = await idb.initDB();
  if (db) {
    openDB.value = db;
    dbReady.value = true;
    getLocalUser(db)
    loadNotes(db);
  } else {
    alert("could not open DB");
  }
};

const loadNotes = async (db: IDBDatabase) => {
  notes.value = await getAllNotes(db);
};
const getLocalUser = async(db: IDBDatabase) => {
  const res= await getUser(db)
  if (res.length < 1){
    navigateTo("/notes?newUser=true") // Better way here?
  }
  username.value = res[0].name
}

const deleteNote = async (id: string) => {
  if (openDB.value) {
    const updatedNotes = await deleteNoteByID(openDB.value, id);
    if (updatedNotes) {
      toast.success("Deleted successfully");
      notes.value = updatedNotes;
    } else {
      toast.error("Could not delete note");
    }
  }
};

const handleCreateUser = async (e: Event) => {
  e.preventDefault();
  const user: User = {
    name: username.value
  }
 
  if (openDB.value) {
    const success = await createUser(openDB.value, user);
    if (success) {
      toast.success(`Saved ${user.name}`);
      newUser.value = false
      navigateTo("/notes") // remove the new user flag
    }
  }
};

onMounted(() => {
  handleInitDB();
  if (typeof qParams.error === "string") {
    toast.error(qParams.error);
    navigateTo("/notes"); //clear the error
  }

if (typeof(isNewUser) === "string"){
  newUser.value = true
}
// getLocalUser()
});
</script>

<template>
  <Toaster />
  <main>
    <div v-show="newUser">
      <dialog class="modal" :open="newUser">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <form @submit="handleCreateUser" class="flex flex-col items-center justify-center gap-4 p-3 mt-2">
    <h2 class="font-bold text-lg">What do you call yourself</h2>
      <input required class="input input-bordered w-5/6" type="text" v-model="username" placeholder="Finn">
      <button type="submit" class="btn bg-emerald-400/70 text-slate-800 hover:bg-emerald-400/60 transition-all transition-ease">Set username</button>
    </form>
  </div>
</dialog>
    </div>
   <div class="h-[30svh] flex flex-col items-center justify-center">
    <div class="w-full inline-flex justify-start items-center top-0 fixed p-3">
      <h1>Hello {{ username  }}</h1>
    </div>
      <h1 class="text-slate-300 text-4xl font-bold">All notes</h1>
    </div>

    <div>
      <div v-if="notes && notes.length >= 1">
        <div
          v-for="note in notes"
          :key="note.id"
          class="gap-3 flex flex-col items-center m-4"
        >
          <div
            class="w-full md:w-4/6 bg-slate-700/50 shadow-md rounded-md p-3 justify-between inline-flex items-center"
          >
          <NuxtLink :to="`notes/${note.id}`"
     class="w-full flex flex-col">
              <h3 class="text-lg font-semibold">{{ note.title }}</h3>
              <span class="italic text-sm">
                {{ dayjs(note.created_at).format("MMM D, h:mm A") }}
              </span>
            </NuxtLink>
            <div class="p-3 inline-flex items-center justify-center">
              <button
                @click="
                  () => {
                    deleteNote(note.id);
                  }
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5 text-red-500"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <NuxtLink
          to="/new"
          class="inline-flex items-center justify-center w-full"
        >
          <div
            class="w-[95%] md:w-3/6 bg-slate-700 shadow-md p-3 h-[20svh] rounded-md flex flex-col items-center justify-center"
          >
            <h1 class="text-center text-2xl">Nothing here</h1>
            <span class="italic text-md text-slate-400 underline"
              >create new note</span
            >
          </div>
        </NuxtLink>
      </div>
    </div>
    <div class="fixed bottom-0 inline-flex items-center justify-end w-full p-5">
      <NuxtLink to="/new" class="btn btn-circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </NuxtLink>
    </div>
  </main>
</template>
