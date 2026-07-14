"use client";

import { useState } from "react";

import Cropper, {
  Area,
} from "react-easy-crop";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";

import { Slider } from "@/src/components/ui/slider";

import { CropperModalProps } from "./types";

export default function CropperModal({

  open,

  image,

  onClose,

  onSave,

}: CropperModalProps) {

  const [crop, setCrop] =
    useState({
      x: 0,
      y: 0,
    });

  const [zoom, setZoom] =
    useState(1);

  const [
    croppedAreaPixels,
    setCroppedAreaPixels,
  ] = useState<Area>();

  async function handleSalvar() {

    if (!croppedAreaPixels) return;

    onSave(croppedAreaPixels);

  }

  return (

    <Dialog
      open={open}
      onOpenChange={onClose}
    >

      <DialogContent
        className="max-w-4xl"
      >

        <DialogHeader>

          <DialogTitle>

            Editar imagem

          </DialogTitle>

        </DialogHeader>

        <div
          className="
          relative
          h-[500px]
          rounded-xl
          overflow-hidden
          bg-black
          "
        >

          <Cropper

            image={image}

            crop={crop}

            zoom={zoom}

            aspect={1}

            onCropChange={setCrop}

            onZoomChange={setZoom}

            onCropComplete={(_, areaPixels) =>
              setCroppedAreaPixels(
                areaPixels
              )
            }

          />

        </div>

        <div className="space-y-4">

          <p
            className="
            text-sm
            font-medium
            "
          >

            Zoom

          </p>

          <Slider

            min={1}

            max={3}

            step={0.1}

            value={[zoom]}

            onValueChange={([value]) =>
              setZoom(value)
            }

          />

        </div>

        <div
          className="
          flex
          justify-end
          gap-3
          mt-6
          "
        >

          <Button
            variant="outline"
            onClick={onClose}
          >

            Cancelar

          </Button>

          <Button
            onClick={handleSalvar}
          >

            Salvar

          </Button>

        </div>

      </DialogContent>

    </Dialog>

  );

}