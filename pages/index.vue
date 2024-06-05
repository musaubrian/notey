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
  if (user.length >= 1) {
    newUser.value = false;
  }
};
const toCreateUserRoute = (userStatus: boolean) => {
  return userStatus ? "/notes?newUser=true" : "/notes";
};

onMounted(() => {
  handleInitDB();
});
</script>

<template>
  <Toaster />
  <main class="flex flex-col gap-3 items-start p-3 justify-center h-screen">
    <h1 class="text-5xl font-semibold">Notey: Your Notes, Your Way </h1>
    <!--    <h2 class="text-3xl font-semibold">Your Notes, Your Way</h2>-->
    <p class="text-xl tracking-tight text-pretty w-full md:w-4/6 my-3">
      Enjoy a seamless, offline experience with all your data securely stored on your device.
    </p>
    <NuxtLink :to="toCreateUserRoute(newUser)" class="btn bg-slate-600 text-lg hover:bg-slate-600/50 transition-all">
      {{ newUser ? "Get started" : "Dive back in" }}
    </NuxtLink>
  </main>
</template>
