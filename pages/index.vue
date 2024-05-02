<script setup lang="ts">
import idb from "~/idb/idb";
import { getUser } from "~/idb/store";

import { Toaster, toast } from "@steveyuowo/vue-hot-toast";
import "@steveyuowo/vue-hot-toast/vue-hot-toast.css";

const openDB = ref<IDBDatabase | null>(null);
const newUser = ref(true);

const handleInitDB = async () => {
  const db = await idb.initDB();
  if (db) {
    openDB.value = db;
    getLocalUser(db);
  } else {
    toast.error("could not open DB");
  }
};

const getLocalUser = async (db: IDBDatabase) => {
  const user = await getUser(db);
  // console.log("USER: ", user);
  if (user.length >= 1){
    newUser.value = false
  }
};
const toCreateUserRoute = (userStatus: boolean) => {
  return userStatus ? "/notes?newUser=true":"/notes"

}

onMounted(() => {
  handleInitDB();
});
</script>

<template>
  <Toaster />
  <main class="flex flex-col items-center justify-center">
    <h1>Notey</h1>

    <p>Your personal, private note taking app</p>
    <NuxtLink :to="toCreateUserRoute(newUser)">
      {{ newUser ? "Let's get started": "Dive back in" }}

    </NuxtLink>
    
    
  </main>
</template>
