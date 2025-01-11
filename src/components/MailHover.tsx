"use client";

import React from 'react'
import { useState } from "react";
import { 
  Mail,
  MailOpen
} from "lucide-react";
import Link from "next/link";


const MailHover = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href="mailto:rani@ucsd.edu?subject=Hello&body=Hi Ryan, I would like to get in touch with you!">
            <div
              className="flex items-center font-light hover:text-blue"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {hovered ? (
                <div
                className="flex items-center font-light hover:text-blue"
                >
                  <MailOpen className=" ml-2 mr-2 size-5 " /> rani@ucsd.edu
                </div>
              ) : (
                <div
                className="flex items-center font-light hover:text-blue"
                >
                  <Mail className=" ml-2 mr-2 size-5 " /> rani@ucsd.edu
                </div>
                
              )}
            </div>
    </Link>
  )
}

export default MailHover
