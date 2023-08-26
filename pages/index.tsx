import Head from "next/head";
import { useContext } from "react";
import { UserContext } from "@/config/auth";
import Layout from "@/components/layout";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function Home() {
  const user: any = useContext(UserContext);
  return <DndProvider backend={HTML5Backend}>
    {/* Your draggable components here */}
    <Layout />
  </DndProvider>;
}
