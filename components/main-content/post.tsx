import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
  } from "@/components/ui/card"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { UserRound } from "lucide-react"
import { CommentButton } from "./comment-button";
import { HeartButton } from "./heart-button";



export function Post() {
    return(
        <div>
            <Card className="grid gap-2 p-0 md:px-16">
                <CardHeader className="flex-row items-center p-0 m-4 md:m-0">
                    <div>
                        <Avatar>
                            <AvatarImage src="https://github.com/raithend.png" />
                            <AvatarFallback><UserRound/></AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="pl-2">
                        <div className="text-base font-semibold">
                            UserName
                        </div>
                        <div>
                            UserID
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Carousel>
                    <CarouselContent>
                        {Array.from({ length: 5 }).map((_, index) => (
                        <CarouselItem key={index}>
                        <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-0">
                                <Image
                                src="/blackbuck.jpg"
                                alt="Blackbuck picture"
                                width={1000}
                                height={1000}
                                />
                            </CardContent>
                        </Card>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="hidden md:block">
                        <CarouselPrevious />                    
                    </div>
                    <div className="hidden md:block">
                        <CarouselNext />                    
                    </div>
                    </Carousel>
                </CardContent>

                <CardFooter className="ml-12 md:m-0 p-0">
                    <div className="grid gap-4">
                        <div className="grid gap-1">
                            <div>
                                Description
                            </div>
                            <div>
                                Location
                            </div>
                            <div>
                                Taxonomy
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <HeartButton/>
                            <CommentButton/>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

