<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>


<script setup>
import { ref, watch } from "vue";

const file = ref(null);

watch(file, async (newValue) => {
  // Upload the file to the backend
  const formData = new FormData();
  formData.append("file", newValue);

  // Post the file to the backend
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  // Convert the response to JSON
  const json = await response.json();

  alert(JSON.stringify(json));
});
</script>

<template>
  <div class="about">
    <section>
      <o-field class="file">
        <o-upload v-model="file">
          <o-button tag="a" variant="primary">
            <o-icon icon="upload" />
            <span>Click to upload</span>
          </o-button>
        </o-upload>
        <span v-if="file" class="file-name">
          {{ file.name }}
        </span>
      </o-field>
    </section>
  </div>
</template>
