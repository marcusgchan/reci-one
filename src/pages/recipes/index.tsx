import React, { useState } from "react";
import { trpc } from "../../utils/trpc";
import useIsMobile from "../../shared/hooks/useIsMobile";
import Image from "next/image";
import { inferQueryOutput } from "../../utils/trpc";
import { type } from "os";

const Index = () => {
  const { data, isLoading, isError } = trpc.useQuery(["recipes.getAll"]);

  const [modalOpen, setModalOpen] = useState(false);

  const isMobile = useIsMobile();

  const toggleModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setModalOpen((prev) => !prev);
  };

  if (isLoading || isError) {
    return <div>IS LOADING</div>;
  }

  if (isMobile) {
    return (
      <section
        className="grid grid-cols-1 gap-20 mx-auto"
        style={{ width: "fit-content" }}
      >
        <form className="flex gap-3 sticky top-1 z-10">
          <input type="text" className="border border-primary" />
          <button className="border border-primary bg-white">SEARCH</button>
        </form>
        <Recipes data={data} />
        <button className="fixed bottom-0 left-0">UP</button>
        <button className="fixed bottom-0 right-0">FILTER</button>
      </section>
    );
  }

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:col-span-4 gap-20 mx-auto"
      style={{ width: "fit-content" }}
    >
      <ModalBackground modalOpen={modalOpen} toggleModal={toggleModal}>
        <Modal modalOpen={modalOpen} toggleModal={toggleModal} />
      </ModalBackground>
      <form className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex justify-between">
        <div className="flex gap-3">
          <input type="text" className="border border-primary" />
          <button className="border border-primary">SEARCH</button>
        </div>
        <button onClick={(e) => toggleModal(e)}>FILTER</button>
      </form>
      <Recipes data={data} />
    </section>
  );
};

const Recipes = ({
  data,
}: {
  data: inferQueryOutput<"recipes.getAll"> | undefined;
}) => {
  return (
    <>
      {data
        ? data.map(({ id, name }: { id: string; name: string }) => (
            <RecipeCard key={id} id={id} name={name} />
          ))
        : []}
    </>
  );
};

const RecipeCard = ({ id, name }: { id: string; name: string }) => {
  return (
    <article className="flex flex-col bg-accent border border-primary w-60 h-80 mx-auto">
      <div className="w-full flex basis-3/5 relative">
        <Image
          layout="fill"
          objectFit="cover"
          src="https://storage.googleapis.com/recipe-website-bucket/test-images/apple-550x396.jpeg"
        />
      </div>
      <div className="flex flex-1 justify-center items-center border-t border-primary">
        <h2>{name}</h2>
      </div>
    </article>
  );
};

type ModalStateAndSetter = {
  modalOpen: boolean;
  toggleModal: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

const Modal = ({ modalOpen, toggleModal }: ModalStateAndSetter) => {
  return (
    <article
      className={`z-50 h-80 w-56 relative bg-slate-50 ${
        modalOpen ? "scale-1" : "scale-0"
      } transition-transform`}
    >
      <h3 className="text-primary">FILTERS</h3>
      <div className="text-primary">Bruh</div>
    </article>
  );
};

const ModalBackground = ({
  children,
  modalOpen,
  toggleModal,
}: {
  children: React.ReactElement;
} & ModalStateAndSetter) => {
  return (
    <button
      className={`inset-0 fixed bg-[#0000002d] z-40 flex items-center justify-center ${
        modalOpen ? "scale-1" : "scale-0"
      }`}
      onClick={toggleModal}
    >
      {children}
    </button>
  );
};

export default Index;
