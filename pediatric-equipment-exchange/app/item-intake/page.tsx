"use client";

import SideBar from "@/components/sidebar";
import { useForm, SubmitHandler } from "react-hook-form"
import { ItemFields } from "@/mock-item-fields";
import { CONDITION_OPTIONS, STATUS_OPTIONS, CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS, COLOR_OPTIONS} from "@/item-field-options";


export default function ItemIntake() {
   
  const { register, handleSubmit, formState: {errors} } = useForm<ItemFields>()
  const onSubmit: SubmitHandler<ItemFields> = (data) => console.log(data)

    return ( 
        <> 
        <div className = "flex min-h-screen bg-[#51b6b6]">
            <SideBar />
            <div className="flex flex-1 justify-center md:p-10">

            {/* main card box */}
            <main className = "flex flex-col md:flex-row w-full border rounded-3xl border-teal-800 bg-white">

            {/* left side for images and qr code */}
            <div className="flex flex-col md:w-1/2">

                {/* top half for image upload */}
                <div className="flex-1 border rounded-2xl border-teal-800"> <p className="text-2xl px-3 py-3"> Upload images </p> </div>

                {/* bottom half for QR code generation */}
                <div className="flex-1 border rounded-2xl border-teal-800"> <p className="text-2xl px-3 py-3"> Click to generate QR code </p> </div>
            </div>

            {/* right side for form inputs  */}
            <div className="md:w-1/2"> 
              <form  onSubmit={handleSubmit(onSubmit)}>
                <ul className="flex flex-col space-y-2 items-center gap-3"> 

                  <li className="py-3"> *
                      <input placeholder="Item Name" className="bg-rose-400 border border-rose-900 rounded-3xl text-center hover:shadow-xl" 
                      {...register("name", { required: "Name is required!"})}/>
                      <p> {errors.name?.message}</p>
                  </li>

                  <li> *
                    <select {...register("category", { required: "Category is required!"})} className="bg-rose-400 border border-black rounded-3xl hover:shadow-xl text-center"> 
                      {/* dropdown menu for categories  */}
                      <option value=""> Select a category </option>
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category} className="bg-white">
                          {category}
                        </option>
                      ))}
                    </select>
                    <p> {errors.category?.message}</p>
                  </li>

                  <li>
                    <select {...register("subcategory")} className="bg-rose-400 border border-black rounded-3xl hover:shadow-xl text-center">
                      <option value=""> Select a subcategory </option>
                      {SUBCATEGORY_OPTIONS.map((subcategory) => (
                        <option key={subcategory} value={subcategory} className="bg-white">
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  </li>

                  <li> *
                    <select {...register("condition", { required: "Condition is required!"})} className="bg-rose-400 border border-black rounded-3xl hover:shadow-xl text-center">
                      <option value=""> Select item conditoin </option>
                      {CONDITION_OPTIONS.map((condition) => (
                        <option key={condition} value={condition} className="bg-white">
                          {condition}
                        </option>
                      ))}
                    </select>
                    <p> {errors.condition?.message}</p>
                  </li>

                  <li>
                    <input placeholder="Item description" className="bg-rose-400 border border-black rounded-3xl text-center hover:shadow-xl" 
                    {...register("description")} />
                  </li>

                  <li>
                    <input placeholder="Size" className="bg-rose-400 border border-black rounded-3xl text-center hover:shadow-xl" 
                    {...register("size")} />
                  </li>

                  <li> *
                    <select {...register("color", { required: "Color is required!"})} className="bg-rose-400 border border-black rounded-3xl hover:shadow-xl text-center">
                      <option value=""> Select a color </option>
                      {COLOR_OPTIONS.map((color) => (
                        <option key={color} value={color} className="bg-white">
                          {color}
                        </option>
                      ))}
                    </select>
                    <p> {errors.color?.message}</p>
                  </li>

                  <li> *
                    <select {...register("status", { required: "Status is required!"})} className="bg-rose-400 border border-black rounded-3xl hover:shadow-xl text-center">
                      <option value=""> Select item status </option>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status} className="bg-white">
                          {status}
                        </option>
                      ))}
                    </select>
                    <p> {errors.status?.message}</p>
                  </li>

                  <li>
                    <input placeholder="Donor name" className="bg-rose-400 border border-black rounded-3xl text-center hover:shadow-xl" 
                    {...register("donor")} />
                  </li>

                  <li>
                    <input className="bg-rose-400 border border-black rounded-3xl hover:shadow-xl" type="submit" />
                  </li>
                </ul>
              </form> 
            </div>

          </main>
        </div>
        </div>
        </>)
}