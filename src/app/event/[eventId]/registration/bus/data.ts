export interface BusReservationData {
  departureLocation: string;
  paymentMethod: 'card' | 'bank_transfer';
}

export interface BusLocation {
  id: string;
  name: string;
  departureTime: string;
  capacity: number;
  price: number;
  available: boolean;
}

export const busLocations: BusLocation[] = [
  {
    id: 'seoul_station',
    name: '서울역',
    departureTime: '05:00',
    capacity: 50,
    price: 20000,
    available: true
  },
  {
    id: 'gangnam_station',
    name: '강남역',
    departureTime: '05:30',
    capacity: 45,
    price: 20000,
    available: true
  },
  {
    id: 'jamsil_station',
    name: '잠실역',
    departureTime: '06:00',
    capacity: 40,
    price: 20000,
    available: true
  },
  {
    id: 'bundang_station',
    name: '분당역',
    departureTime: '05:15',
    capacity: 35,
    price: 20000,
    available: true
  },
  {
    id: 'suwon_station',
    name: '수원역',
    departureTime: '04:45',
    capacity: 30,
    price: 20000,
    available: true
  }
];

export const paymentMethods = [
  { id: 'bank_transfer', label: '무통장 입금', description: '계좌이체' }
];
