import { Card, CardBody } from "@heroui/card";

export default function DriverRequestsPage() {
 return (
  <div className="p-4 pb-24">
   <h1 className="text-2xl font-bold mb-4">Ride Requests</h1>
   <Card>
    <CardBody>
     <p>Incoming ride requests will appear here.</p>
    </CardBody>
   </Card>
  </div>
 );
}
