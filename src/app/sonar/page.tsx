"use client";

import React from "react";
import { initialProject } from "@/utils/initialProjectData";
import { WhaleSonarMobileApp } from "@/components/WhaleSonarMobileApp";

export default function SonarStandalonePage() {
  return (
    <WhaleSonarMobileApp
      words={initialProject.crypticWords}
      grammar={initialProject.crypticGrammar}
      standalone={true}
    />
  );
}
