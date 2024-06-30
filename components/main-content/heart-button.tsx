"use client"

import { HeartIcon } from "lucide-react"
import { useState } from "react";

export function HeartButton() {
    const [flag, setCount] = useState(false);
    console.log(flag)

    return(
        <div>
            <button type="button" onClick={() => setCount(!flag)}>
                {flag?<HeartIcon className="color = text-red-600 fill-red-600"/>
                    :<HeartIcon/>
                }

            </button>
        </div>
    )
}