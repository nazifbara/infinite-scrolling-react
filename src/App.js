import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef, useCallback } from 'react';

const fetchNames = async ({
  pageParam = 'https://pokeapi.co/api/v2/pokemon?limit=5',
}) => await axios.get(pageParam);

export default function App() {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ['names'],
      queryFn: fetchNames,
      getNextPageParam: (lastPage, pages) => lastPage.data.next,
    });

  const intObserver = useRef(null);
  const secondLastLIRef = useCallback(
    (li) => {
      if (isLoading) return;

      if (intObserver.current) intObserver.current.disconnect();

      intObserver.current = new IntersectionObserver((li) => {
        if (li[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (li) intObserver.current.observe(li);
    },
    [isLoading, fetchNextPage, hasNextPage]
  );

  if (isLoading) {
    return <span>loading...</span>;
  }

  if (isError) {
    return <span>Something went wrong...</span>;
  }

  return (
    <main className="grid gap-10 max-w-xl mx-auto px-2 md:px-10 text-slate-900">
      <h1 className="text-3xl text-center font-bold">Pokemons List</h1>
      {data.pages.map((page, pageIdx) => (
        <ul key={`page-${pageIdx}`} className="gap-6 grid grid-cols-1 ">
          {page.data.results.map((pokemon, resultIdx) => (
            <li
              className="bg-slate-900	w-full flex items-center justify-center h-40 rounded-lg border-solid border-2 border-violet-400 text-violet-400"
              key={pokemon.name}
              ref={
                data.pages.length - 1 === pageIdx &&
                page.data.results.length - 2 === resultIdx
                  ? secondLastLIRef
                  : null
              }
            >
              {pokemon.name}
            </li>
          ))}
        </ul>
      ))}
    </main>
  );
}
