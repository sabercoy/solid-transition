import { createAsync } from "@solidjs/router";
import { createEffect, createSignal, For, Suspense, useTransition } from "solid-js";

type BatchData = {
  cursor: number
  targetAmount: number
}

export type CreationPreview = {
  hashid: string
  title: string
}

const BATCH_MAX_AMOUNT = 30

const getBatch = async (params: {
  cursor: number
  targetAmount: number
}) => {
  const SQUARES = 100
  const mockCreationPreviews: {hashid: string, title: string}[] = []
  for (let i = 0; i < SQUARES; i++) {
    mockCreationPreviews.push({
      hashid: i.toString(),
      title: 'title',
    })
  }

  await new Promise(res => setTimeout(res, 1000))

  const cursor = params.cursor
  const newPreviews = mockCreationPreviews.slice(cursor, cursor + params.targetAmount)
  const nextCursor = cursor + newPreviews.length

  return {
    previews: newPreviews,
    nextCursor: nextCursor
  }
}

export default function Home() {
  const [batchData, setBatchData] = createSignal<BatchData>({ cursor: 0, targetAmount: BATCH_MAX_AMOUNT })
  const [nextCursor, setNextCursor] = createSignal(30)
  const [fetchingBatch, startFetchingBatch] = useTransition()

  createEffect(() => {
    console.log(fetchingBatch() ? 'TRANSITION START' : 'TRANSITION END')
  })

  createEffect(() => {
    console.log('effect:', batchData().cursor)
  })
  
  const creationPreviews = createAsync<CreationPreview[]>(async (previousPreviews) => {
    console.log('before async function:', batchData().cursor)

    const result = await getBatch({
      cursor: batchData().cursor,
      targetAmount: batchData().targetAmount,
    })

    console.log('after async function:', batchData().cursor)

    setNextCursor(result.nextCursor)

    return previousPreviews ? [...previousPreviews, ...result.previews] : result.previews
  })

  /////////////////////////////////////////////////////////////////////
  // const getNextBatch = () => {
  //   setBatchData({
  //     cursor: nextCursor(),
  //     targetAmount: BATCH_MAX_AMOUNT
  //   })
  // }

  const getNextBatch = () => {
    startFetchingBatch(() => (
      setBatchData({
        cursor: nextCursor(),
        targetAmount: BATCH_MAX_AMOUNT
      })
    ))
  }
  /////////////////////////////////////////////////////////////////////

  return (
    <main>
      <button onClick={getNextBatch}>MORE</button>
      <Suspense fallback={<div>LOADING...</div>}>
        <For each={creationPreviews()}>
          {preview => <div>{preview.hashid}</div>}
        </For>
      </Suspense>
    </main>
  );
}
