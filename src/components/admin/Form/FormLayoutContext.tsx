"use client";
import React, { createContext, useContext } from "react";

type Ctx = { labelWidth: number; tightRows: boolean };
const FormLayoutCtx = createContext<Ctx>({ labelWidth: 240, tightRows: false });

export const FormLayoutProvider = ({
  labelWidth,
  tightRows,
  children,
}: { labelWidth: number; tightRows: boolean; children: React.ReactNode }) => {
  return (
    <FormLayoutCtx.Provider value={{ labelWidth, tightRows }}>
      {children}
    </FormLayoutCtx.Provider>
  );
};

export const useFormLayout = () => useContext(FormLayoutCtx);
