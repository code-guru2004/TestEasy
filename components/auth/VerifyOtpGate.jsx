"use client";

import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import OtpDialog from "./OtpDialog";
import OtpDrawer from "./OtpDrawer";

export default function VerifyOtpGate({ children }) {
  const { user, isVerified } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user && !user.isVerified) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [user, isVerified]);

  return (
    <>
      {children}

      {open && (
        <>
          {/* Desktop / Tablet */}
          <div className="hidden md:block">
            <OtpDialog open={open} />
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <OtpDrawer open={open} />
          </div>
        </>
      )}
    </>
  );
}