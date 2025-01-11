import {useState} from "react";


const EmojiFileUploader = () => {

    const [slide, setSlide] = useState(0);
    const fast = slide;
    const Seconds = slide+1;
    const Third = slide+2;

    const images = [
        "Enamul 1",
        "Hossen 2",
        "firoz 3",
        "Modu 4",
        "kodu 5",
        "jodu 6 ",
        "cadu 7",

    ];

    const imageLength = images.length-2 ;

    const right = ()=>{
        if(slide === imageLength){
            setSlide(0);
        }
        else setSlide(slide+1);
    }
    const left = ()=>{
        if(slide === 0){
            setSlide(imageLength);
        }
        else setSlide(slide-1);
    }
    return (
        <div className="grid grid-cols-3 gap-5 container mx-auto text-white "
        >
            <button
                className="p-5 bg-red-500 absolute top-10 left-0"
                onClick={left}
            >
                left
            </button>
            <button
                className="p-5 bg-red-500 absolute top-10 right-0"
                onClick={right}
            >
                Right
            </button>

            <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-5">
                {
                    images.map((image, i) => {

                                    return (
                                        <div

                                            className={i===Seconds ? "p-10 bg-black rounded-full" :"p-10 bg-red-200 rounded-full"}
                                            key={i}
                                        >
                                            1
                                        </div>
                                    )

                    })
                }
            </div>

            {
                images.map((image, i) => {
                   console.log(i)
                    if (i === fast) {
                        return (
                            <div key={i}
                                 className="p-5 bg-black col-span-1 "
                            >
                                {/*<img src={image} alt="one"/>*/}
                                <h1>{image}</h1>
                            </div>
                        )
                    }
                    if (i === Seconds) {
                        return (
                            <div key={i}
                                 className="p-5 bg-red-500 col-span-1 "
                            >
                                {/*<img src={image} alt="two"/>*/}
                                <h1>{image}</h1>
                            </div>
                        )
                    }
                    if (i === Third) {
                        return (
                            <div key={i}
                                 className="p-5 bg-green-500 col-span-1 "
                            >
                                {/*<img src={image} alt="three"/>*/}
                                <h1>{image}</h1>
                            </div>
                        )
                    }

                })
            }
        </div>
    );

};


export default EmojiFileUploader;
