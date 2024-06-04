<script setup lang="ts">
import dayjs from "dayjs";
import { onMounted, ref } from "vue";
import idb from "~/idb/idb";
import {
  getAllNotes,
  deleteNoteByID,
  type Note,
  createUser,
  type User,
  getUser,
  insertNote,
  getNoteByID,
  updateNote,
} from "~/idb/store";
import { Toaster, toast } from "@steveyuowo/vue-hot-toast";
import "@steveyuowo/vue-hot-toast/vue-hot-toast.css";

const dbReady = ref(false);
const newUser = ref(false);
const isNewUser = useRoute().query.newUser;
const username = ref("");
const showSearch = ref(false);
const searchValue = ref("");

//let openDB = ref<IDBDatabase | null>(null);
let openDB: IDBDatabase;
const notes = ref<Note[]>();

const qParams = useRoute().query;

const handleInitDB = async () => {
  const db = await idb.initDB();
  if (db) {
    openDB = db;
    dbReady.value = true;
    getLocalUser(db);
    loadNotes(db);
  } else {
    toast.error("could not open DB");
  }
};

const loadNotes = async (db: IDBDatabase) => {
  notes.value = await getAllNotes(db);
};
const getLocalUser = async (db: IDBDatabase) => {
  const res = await getUser(db);
  if (res.length < 1) {
    navigateTo("/notes?newUser=true"); // Better way here?
  }
  username.value = res[0].name;
};

const deleteNote = async (id: string) => {
  if (openDB) {
    const updatedNotes = await deleteNoteByID(openDB, id);
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
    name: username.value,
  };

  if (openDB) {
    const success = await createUser(openDB, user);
    if (success) {
      toast.success(`Saved ${user.name}`);
      newUser.value = false;
      navigateTo("/notes"); // remove the new user flag
    }
  }
};

const sortedNotes = computed(() => {
  if (!searchValue.value) {
    return notes.value;
  }
  if (notes.value) {
    return notes.value.filter((note) =>
      note.title.toLowerCase().includes(searchValue.value.toLowerCase())
    );
  }
});

const toggleSearch = () => {
  showSearch.value = !showSearch.value;
};
const exportNotes = () => {
  if (notes.value!.length < 1) {
    toast.error("No notes to export");
    return
  }
  const noteyData = JSON.stringify(notes.value);
  const blob = new Blob([noteyData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element
  const a = document.createElement("a");
  a.href = url;
  a.download = `${generatePrettyName().split(" ")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const validateNote = (note: any) => {
  return !!(note.id && note.title && note.content);
}

const handleImport = async () => {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = ".json"
  input.click()

  input.onchange = async (event: Event) => {
    const target = event.target as HTMLInputElement

    // @ts-ignore
    const file = target.files[0]

    if (!file) {
      toast.error("No file selected");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      const importedData = JSON.parse(event.target?.result as string);

      try {
        for (const note of importedData) {
          const validStructure = validateNote(note)

          if (!validStructure) {
            toast.error("Seems the file is corrupted")
            return
          }

          const existingNote = await getNoteByID(openDB, note.id);
          if (existingNote) {
            const confirmation = confirm(
              `Note: <${note.title}> already exists.\nUse imported data?`);
            if (confirmation) {
              await updateNote(openDB, note);
              console.info(`content updated.`);
            } else {
              console.warn(`Skipping overwrite`);
            }
          } else {
            await insertNote(openDB, note);
          }
        }
        toast.success("Import successful!");
      } catch (error) {
        console.error("Error importing notes:", error);
        toast.error("An error occurred during import.");
      }
    }
    reader.readAsText(file)
  }
}

onMounted(() => {
  handleInitDB();
  if (typeof qParams.error === "string") {
    toast.error(qParams.error);
    navigateTo("/notes"); //clear the error
  }

  if (typeof isNewUser === "string") {
    newUser.value = true;
  }
});
</script>

<template>
  <Toaster />
  <main>
    <div v-show="newUser">
      <dialog class="modal" :open="newUser">
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <form @submit="handleCreateUser" class="flex flex-col items-center justify-center gap-4 p-3 mt-2">
            <h2 class="font-bold text-lg">What do you call yourself</h2>
            <input required class="input input-bordered w-5/6" type="text" v-model="username" placeholder="Finn"
              focused />
            <button type="submit"
              class="btn bg-emerald-400/70 text-slate-800 hover:bg-emerald-400/60 transition-all transition-ease">
              Set username
            </button>
          </form>
        </div>
      </dialog>
    </div>
    <header class="h-[30svh] flex flex-col items-center justify-center">
      <div class="h-1/2"></div>
      <div class="w-full flex flex-col items-center justify-center p-3">
        <h1 class="text-slate-300 text-4xl font-bold">All notes</h1>
        <div class="w-full md:w-4/6 inline-flex justify-between items-center p-3">
          <h1 class="text-lg">
            Welcome <strong>{{ username }}</strong>
          </h1>
          <div class="inline-flex items-center justify-end gap-5">
            <button @click="toggleSearch">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                class="w-6 h-6 font-semibold">
                <path fill-rule="evenodd"
                  d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <NuxtLink to="/notes/new" class="">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <path
                  d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
              </svg>
            </NuxtLink>
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="m-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                  <path fill-rule="evenodd"
                    d="M3 9a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9Zm0 6.75a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <button @click="handleImport">
                    Import your data
                  </button>
                </li>
                <li>
                  <button @click="exportNotes">Export your data</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div v-show="showSearch" class="w-5/6 p-3 md:w-3/6 inline-flex items-center justify-center">
        <input v-model="searchValue" type="search" placeholder="creative whale.." class="input w-5/6 input-bordered" />
      </div>
    </header>

    <div>
      <div v-if="sortedNotes && sortedNotes.length >= 1">
        <div v-for="note in sortedNotes" :key="note.id" class="gap-3 flex flex-col items-center m-4">
          <div
            class="w-full md:w-4/6 bg-slate-700/50 shadow-md rounded-md p-3 justify-between inline-flex items-center">
            <NuxtLink :to="`notes/${note.id}`" class="w-full flex flex-col">
              <h3 class="text-lg font-semibold">{{ note.title }}</h3>
              <span class="italic text-sm">
                {{ dayjs(note.created_at).format("MMM D, h:mm A") }}
              </span>
            </NuxtLink>
            <div class="p-3 inline-flex items-center justify-center">
              <button @click="() => {
                deleteNote(note.id);
              }
                ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="w-5 h-5 text-red-500">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <NuxtLink to="/notes/new" class="inline-flex items-center justify-center w-full">
          <div
            class="w-[95%] md:w-3/6 bg-slate-700 shadow-md p-3 h-[20svh] rounded-md flex flex-col items-center justify-center">
            <h1 class="text-center text-2xl">Nothing here</h1>
            <span class="italic text-md text-slate-400 underline">create new note</span>
          </div>
        </NuxtLink>
      </div>
    </div>
    <div class="fixed bottom-0 inline-flex items-center justify-end w-full p-5"></div>
  </main>
</template>
