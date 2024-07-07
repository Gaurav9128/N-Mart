import { Modal } from 'flowbite-react';
import { Combobox, Transition } from '@headlessui/react'
import react,{ Fragment, useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

const people = [
  { id: 1, name: '302017' },
  { id: 2, name: '302020' },
  { id: 3, name: '302021' },
  { id: 4, name: '302022' },
  { id: 5, name: '302019' },
  { id: 6, name: '302030' },
]

const LocationModal = ({ isOpenLocationModal, setIsOpenLocationModal }) => {
   const [selected, setSelected] = useState(people[0])
  const [query, setQuery] = useState('')

 const filteredPeople =
    query === ''
      ? people
      : people.filter((person) =>
          person.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        )


  return (
    <>
    <Modal dismissible show={isOpenLocationModal} onClose={() => setIsOpenLocationModal(false)}>
        <Modal.Header>Location</Modal.Header>
        <Modal.Body className='flex flex-col items-center gap-4'>
            <Combobox value={selected} onChange={setSelected}>
                <div className="relative mt-1 w-full">
                <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                    <Combobox.Input
                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                    displayValue={(person) => person.name}
                    onChange={(event) => setQuery(event.target.value)}
                    />
                    {/* <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                    />
                    </Combobox.Button> */}
                </div>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                >
                    <Combobox.Options className=" mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    {filteredPeople.length === 0 && query !== '' ? (
                        <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                        Nothing found.
                        </div>
                    ) : (
                        filteredPeople.map((person) => (
                        <Combobox.Option
                            key={person.id}
                            className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-teal-600 text-white' : 'text-gray-900'
                            }`
                            }
                            value={person}
                        >
                            {({ selected, active }) => (
                            <>
                                <span
                                className={`block truncate ${
                                    selected ? 'font-medium' : 'font-normal'
                                }`}
                                >
                                {person.name}
                                </span>
                                {selected ? (
                                <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? 'text-white' : 'text-teal-600'
                                    }`}
                                >
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                ) : null}
                            </>
                            )}
                        </Combobox.Option>
                        ))
                    )}
                    </Combobox.Options>
                </Transition>
                </div>
            </Combobox>
            <img className='w-64' src='https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2Flocationimage.jpg?alt=media&token=685de22e-d1d5-4ba7-a3cf-79c90c528d9e' />
        </Modal.Body>
        <Modal.Footer>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default LocationModal