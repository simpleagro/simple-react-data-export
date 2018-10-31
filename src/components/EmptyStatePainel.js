import React from "react";
import emptyStateImage from "../assets/keep-explore.svg";

export const EmptyStatePainel = () => (
  <div className="Aligner emptyState">
    <div className="center">
      <img alt="Seja bem vindo" width="120" src={emptyStateImage} />
      <br />
      <br />
      <p>Seja bem vindo! Continue explorando!</p>
    </div>
  </div>
);
