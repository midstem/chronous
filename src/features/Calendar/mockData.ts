import { CalendarEventType } from '../../types'

import { returnDayDate } from './helpers'

const currentDate = new Date()

export const mockEvents: CalendarEventType[] = [
  // MONDAY
  {
    id: '312de45c-62cb-4da8-ad9e-c973090d7e3c',
    title: 'Temp Client & Anna Adkins',
    start: returnDayDate(currentDate, 1) + 'T07:00:00',
    end: returnDayDate(currentDate, 1) + 'T14:00:00',
    type: 'client_appointment',
    overlapping: 3,
    position: '24%',
    width: '26%',
    color: '#F4511E',
    textColor: '#FFFFFF',
    opacity: 0.8,
    markerColor: '#B9E9E0',
  },
  {
    id: 'c0e982c0-c152-4930-8aae-b2a9b334052b',
    title: 'Temp Client & Alexis Jensen',
    start: returnDayDate(currentDate, 1) + 'T08:00:00',
    end: returnDayDate(currentDate, 1) + 'T09:00:00',
    type: 'client_appointment',
    overlapping: 4,
    position: '32%',
    width: '18%',
    color: '#F4511E',
    textColor: '#FFFFFF',
    opacity: 0.8,
    markerColor: '#B9E9E0',
  },
  {
    id: '29af7782-5383-4a05-8d7a-ec402d6c9e47',
    title: 'Temp Client & Ashley Horton',
    start: returnDayDate(currentDate, 1) + 'T15:00:00',
    end: returnDayDate(currentDate, 1) + 'T20:00:00',
    type: 'client_appointment',
    overlapping: 1,
    position: '8%',
    width: '42%',
    color: '#F4511E',
    textColor: '#FFFFFF',
    opacity: 0.8,
    markerColor: '#B9E9E0',
  },

  // TUESDAY
  {
    id: 'f3597ec3-9219-43a2-9694-f06e0630c8ed',
    title: 'Temp Client',
    start: returnDayDate(currentDate, 2) + 'T07:00:00',
    end: returnDayDate(currentDate, 2) + 'T22:00:00',
    type: 'client_availability',
    overlapping: 0,
    position: '0%',
    width: '50%',
    color: '#F4511E',
    textColor: '#FFFFFF',
    opacity: 0.3,
    markerColor: '',
  },

  // WEDNESDAY
  {
    id: '3db62b4c-ab38-43bd-a69e-e8884ae48bbc',
    title: 'Temp Client & Alexis Jensen',
    start: returnDayDate(currentDate, 3) + 'T17:00:00',
    end: returnDayDate(currentDate, 3) + 'T18:00:00',
    type: 'client_appointment',
    overlapping: 2,
    position: '16%',
    width: '34%',
    color: '#F4511E',
    textColor: '#FFFFFF',
    opacity: 0.8,
    markerColor: '#B9E9E0',
  },
  {
    id: '81cac69e-9da8-43b1-8765-9cec7aceafbc',
    title: 'Temp Client & Angela Stephens',
    start: returnDayDate(currentDate, 3) + 'T18:00:00',
    end: returnDayDate(currentDate, 3) + 'T19:00:00',
    type: 'client_appointment',
    overlapping: 2,
    position: '16%',
    width: '34%',
    color: '#F4511E',
    textColor: '#FFFFFF',
    opacity: 0.8,
    markerColor: '#B9E9E0',
  },

  // THURSDAY
  {
    id: '1cc3bbcd-aff8-475b-9f46-6ce91681c2dc',
    title: 'Temp Client & Allison Bond',
    start: returnDayDate(currentDate, 4) + 'T21:00:00',
    end: returnDayDate(currentDate, 4) + 'T22:00:00',
    type: 'client_appointment',
    overlapping: 1,
    position: '8%',
    width: '42%',
    color: '#F4511E',
    textColor: '#FFFFFF',
    opacity: 0.8,
    markerColor: '#B9E9E0',
  },
  {
    id: '80b66527-8b45-4765-9ae1-88d21e3444ab',
    title: 'Temp Client & Alexis Jensen',
    start: returnDayDate(currentDate, 4) + 'T21:00:00',
    end: returnDayDate(currentDate, 4) + 'T22:00:00',
    type: 'client_appointment',
    overlapping: 2,
    position: '16%',
    width: '34%',
    color: '#F4511E',
    textColor: '#FFFFFF',
    opacity: 0.8,
    markerColor: '#B9E9E0',
  },
  {
    id: 'f51ba7a4-da9a-44ce-ba07-a0ed1ebb51b7',
    title: 'Dakota Roman',
    start: returnDayDate(currentDate, 4) + 'T16:30:00',
    end: returnDayDate(currentDate, 4) + 'T22:00:00',
    type: 'member_availability',
    overlapping: 0,
    position: '50%',
    width: '50%',
    color: '#C0CA33',
    textColor: '#1F1F1F',
    opacity: 0.3,
    markerColor: '',
  },

  // FRIDAY
  {
    id: '9440385f-eedf-42af-8776-12fbcf9a2d1f',
    title: 'Temp Client & Allison Bond',
    start: returnDayDate(currentDate, 5) + 'T07:00:00',
    end: returnDayDate(currentDate, 5) + 'T16:15:00',
    type: 'client_appointment',
    overlapping: 3,
    position: '24%',
    width: '26%',
    color: '#F4511E',
    textColor: '#FFFFFF',
    opacity: 0.8,
    markerColor: '#B9E9E0',
  },
  {
    id: '070d0f2f-9174-4f54-8c2a-3e20efb9a0a9',
    title: 'Temp Client & Alexis Jensen',
    start: returnDayDate(currentDate, 5) + 'T10:00:00',
    end: returnDayDate(currentDate, 5) + 'T15:45:00',
    type: 'client_appointment',
    overlapping: 2,
    position: '16%',
    width: '34%',
    color: '#F4511E',
    textColor: '#FFFFFF',
    opacity: 0.8,
    markerColor: '#B9E9E0',
  },

  // SATURDAY
  {
    id: '08de6b94-de55-4618-a118-bcc0e5930c84',
    title: 'Dakota Roman',
    start: returnDayDate(currentDate, 6) + 'T07:00:00',
    end: returnDayDate(currentDate, 6) + 'T16:00:00',
    type: 'member_availability',
    overlapping: 0,
    position: '50%',
    width: '50%',
    color: '#C0CA33',
    textColor: '#1F1F1F',
    opacity: 0.3,
    markerColor: '',
  },

  // SUNDAY
  {
    id: '98f6c30c-a95e-4794-b2ee-5c0143cbe0b5',
    title: 'Temp Client',
    start: returnDayDate(currentDate, 7) + 'T07:00:00',
    end: returnDayDate(currentDate, 7) + 'T22:00:00',
    type: 'client_availability',
    overlapping: 0,
    position: '0%',
    width: '50%',
    color: '#F4511E',
    textColor: '#FFFFFF',
    opacity: 0.3,
    markerColor: '',
  },
  {
    id: '868ffe1d-42c1-42d9-afe0-37a97f315ca2',
    title: 'Dakota Roman',
    start: returnDayDate(currentDate, 7) + 'T16:30:00',
    end: returnDayDate(currentDate, 7) + 'T22:00:00',
    type: 'member_availability',
    overlapping: 0,
    position: '50%',
    width: '50%',
    color: '#C0CA33',
    textColor: '#1F1F1F',
    opacity: 0.3,
    markerColor: '',
  },
  {
    id: 'ad58fa12-9850-47b0-9a8a-da6d80c60b8f',
    title: 'Dakota Roman & $$$Do not touch this client',
    start: returnDayDate(currentDate, 7) + 'T07:00:00',
    end: returnDayDate(currentDate, 7) + 'T09:00:00',
    type: 'member_appointment',
    overlapping: 1,
    position: '58%',
    width: '42%',
    color: '#C0CA33',
    textColor: '#1F1F1F',
    opacity: 0.8,
    markerColor: '#006C73',
  },
]
