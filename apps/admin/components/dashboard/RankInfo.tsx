import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import Image from "next/image";

interface RankInfoProps {
 address: string;
 region: string;
 city: string;
 province: string;
 description?: string | null;
 lat: number;
 lng: number;
 phone?: string | null;
 operatingHours?: string | null;
 image?: string | null;
}

export const RankInfo = ({
 address,
 region,
 city,
 province,
 description,
 lat,
 lng,
 phone,
 operatingHours,
 image,
}: RankInfoProps) => {
 return (
  <Card className="w-full">
   <CardHeader>
    <h2 className="text-xl font-semibold">Rank Information</h2>
   </CardHeader>
   <CardBody className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
     <div>
      <p className="text-sm text-default-500">Address</p>
      <p className="font-medium">{address}</p>
     </div>
     <div>
      <p className="text-sm text-default-500">Region</p>
      <p className="font-medium">{region}</p>
     </div>
     <div>
      <p className="text-sm text-default-500">City</p>
      <p className="font-medium">{city}</p>
     </div>
     <div>
      <p className="text-sm text-default-500">Province</p>
      <p className="font-medium">{province}</p>
     </div>
    </div>

    {description && (
     <>
      <Divider />
      <div>
       <p className="text-sm text-default-500">Description</p>
       <p className="text-sm mt-1">{description}</p>
      </div>
     </>
    )}

    <Divider />

    <div className="grid grid-cols-2 gap-4">
     <div>
      <p className="text-sm text-default-500">Coordinates</p>
      <p className="text-sm font-mono">
       {lat}, {lng}
      </p>
     </div>
     {phone && (
      <div>
       <p className="text-sm text-default-500">Phone</p>
       <p className="text-sm">{phone}</p>
      </div>
     )}
     {operatingHours && (
      <div>
       <p className="text-sm text-default-500">Operating Hours</p>
       <p className="text-sm">{operatingHours}</p>
      </div>
     )}
    </div>

    {image && (
     <>
      <Divider />
      <div>
       <p className="text-sm text-default-500 mb-2">Image</p>
       <div className="relative w-full h-48">
        <Image src={image} alt="Rank Image" fill className="object-cover rounded-lg" />
       </div>
      </div>
     </>
    )}
   </CardBody>
  </Card>
 );
};
