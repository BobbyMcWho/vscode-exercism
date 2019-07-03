<script>
    import { store, filterByTopic, updateCurrentTabIndex, sendMessageToVSC, getExerciseSolutions } from './store.js';
    import * as marked from "marked";
</script>

{#if $store.view === "exercise" }
    <header>
        <div class="top-section">
            <div class="icon" style="--exerciseIconLight: url('{$store.exerciseIconPath.light}'); --exerciseIconDark: url('{$store.exerciseIconPath.dark}')"></div>
            <div class="meta">
                <h3>
                    {$store.exercise.name}
                    <small class="difficulty">
                        {#if $store.exercise.difficulty.length === 1}
                            Easy
                        {:else if $store.exercise.difficulty.length === 2}
                            Intermediate
                        {:else}
                            Hard
                        {/if}
                    </small>
                </h3>
                <p class="summary">
                    {$store.exercise.summary}
                    {#each $store.exercise.topics as topic}
                        <a class={$store.topicBeingFiltered === topic ? "topic active" : "topic"} href="javascript:;" on:click="{() => filterByTopic(topic)}">#{topic}</a>
                    {/each}
                </p>
            </div>
            <div class="actions">
                <!-- 4 is completed -->
                {#if $store.exercise.status & 4 }
                    <button disabled class="action-btn">Complete</button>
                <!-- 1 is downloaded -->
                {:else if $store.exercise.status & 1}
                    <button class="action-btn" on:click="{() => sendMessageToVSC('complete')}">Complete</button>
                {:else}
                    <button class="action-btn" on:click="{() => sendMessageToVSC('download')}">Download</button>
                {/if}
                <button class="action-btn" on:click="{() => sendMessageToVSC('openStart')}">Open & Start</button>
            </div>
        </div>
        <div class="bottom-section">
            {#each ["instructions", "solutions"] as tab, i}
                <a href="javascript:;" on:click="{() => updateCurrentTabIndex(i)}" class={i === $store.currentTabIndex ? "nav-link active" : "nav-link"}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</a>
            {/each}
        </div>
    </header>
    <main>
        {#if $store.currentTabIndex === 0}
            {#if $store.instructions}
                <div>{@html marked.parse($store.instructions)}</div>
            {:else}
                <div>You have to download this exercise before you can view its instructions.</div>
            {/if}
        {:else}
            {#if $store.solutions}
                <div class="solution-list">
                    {#each $store.solutions as solution}
                        <a class="solution" href="https://exercism.io/tracks/{$store.track.id}/exercises/{$store.exercise.id}/solutions/{solution.uuid}">
                            <div style="display: flex; justify-content: space-between">
                                <div>{solution.author}</div>
                                <div>★ {solution.stars}</div>
                            </div>
                        </a>
                    {/each}
                </div>
            {:else}
                <div use:getExerciseSolutions>Loading...</div>
            {/if}
        {/if}
    </main>
{/if}