<script>
  import { writable } from "svelte/store";
  let isLoading = false;
  let result = writable("");
  const formData = {};
  const submit = async () => {
    isLoading = true;
    try {
      const response = await fetch("/api/sendMail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(formData),
      });
      const responseJSON = await response.json();
      result.set(
        responseJSON.result.success
          ? "email was sent"
          : "Error: " + responseJSON.errors.join(";"),
      );
    } catch (e) {
      result.set("Error occured");
    } finally {
      isLoading = false;
    }
  };
</script>

<main>
  {#if isLoading}
    <div class="loader">
      <img src="../loader.gif" alt="loader" />
    </div>
  {:else}
    <form on:submit|preventDefault={submit}>
      <label for="email">Email</label>
      <input
        name="email"
        type="email"
        placeholder="Enter your email"
        bind:value={formData.email}
      />
      <label for="name">Name</label>
      <input
        name="name"
        type="text"
        placeholder="Enter your name"
        bind:value={formData.name}
      />
      <label for="password">Password</label>
      <input
        name="password"
        type="password"
        placeholder="Enter your password"
        bind:value={formData.password}
      />
      <label for="confirmPassword">Confirm Password</label>
      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirm password"
        bind:value={formData.confirmPassword}
      />
      <input type="submit" disabled={isLoading} value="Send" />
    </form>
    <div>
      <p>{$result}</p>
    </div>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  form {
    border: 1px solid #333;
    padding: 20px;
    border-radius: 5px;
  }

  input {
    border: 1px solid #666;
  }
</style>
