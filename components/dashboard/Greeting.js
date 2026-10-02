"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/components/providers/UserProvider";

export default function Greeting() {
  const { name, ready } = useUser();
  const [g, setG] = useState("Welcome back");
  useEffect(() => {
    const h = new Date().getHours();
    setG(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);
  return <h1 className="text-2xl font-semibold text-slate-50 md:text-3xl">{g}{ready ? `, ${name || "there"}` : ""}</h1>;
}
