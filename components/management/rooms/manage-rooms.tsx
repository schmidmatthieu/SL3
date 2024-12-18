"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Room {
  id: string;
  name: string;
  capacity: number;
}

export function ManageRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomCapacity, setNewRoomCapacity] = useState("");

  const addRoom = () => {
    if (newRoomName && newRoomCapacity) {
      const newRoom: Room = {
        id: Date.now().toString(),
        name: newRoomName,
        capacity: parseInt(newRoomCapacity),
      };
      setRooms([...rooms, newRoom]);
      setNewRoomName("");
      setNewRoomCapacity("");
    }
  };

  const deleteRoom = (id: string) => {
    setRooms(rooms.filter((room) => room.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Rooms</CardTitle>
          <CardDescription>Add and manage rooms for your event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Capacity"
              value={newRoomCapacity}
              onChange={(e) => setNewRoomCapacity(e.target.value)}
            />
            <Button onClick={addRoom}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>

          <div className="space-y-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{room.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Capacity: {room.capacity}
                  </p>
                </div>
                <Button variant="destructive" size="icon" onClick={() => deleteRoom(room.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
