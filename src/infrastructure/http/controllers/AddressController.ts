import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { ListAddressesUseCase } from "../../../application/use-cases/address/ListAddressesUseCase.js";
import { CreateAddressUseCase } from "../../../application/use-cases/address/CreateAddressUseCase.js";
import { UpdateAddressUseCase } from "../../../application/use-cases/address/UpdateAddressUseCase.js";
import { DeleteAddressUseCase } from "../../../application/use-cases/address/DeleteAddressUseCase.js";
import {
  CreateAddressSchema,
  UpdateAddressSchema,
} from "../../../application/dtos/AddressDTO.js";
import { prisma } from "../../database/prisma/client.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class AddressController {
  private async getCustomerId(userId: string): Promise<string> {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!customer) {
      throw new AppError("Perfil de cliente não encontrado", 404);
    }
    return customer.id;
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const customerId = await addressController.getCustomerId(request.user.id);

    const listAddressesUseCase = container.resolve(ListAddressesUseCase);
    const addresses = await listAddressesUseCase.execute(customerId);

    return reply.send(
      addresses.map((a) => ({
        id: a.id,
        street: a.street,
        number: a.number,
        complement: a.complement ?? null,
        neighborhood: a.neighborhood,
        city: a.city,
        state: a.state,
        zipCode: a.zipCode,
        isDefault: a.isDefault,
      })),
    );
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const customerId = await addressController.getCustomerId(request.user.id);
    const data = CreateAddressSchema.parse(request.body);

    const createAddressUseCase = container.resolve(CreateAddressUseCase);
    const address = await createAddressUseCase.execute(customerId, data);

    return reply.status(201).send({
      id: address.id,
      street: address.street,
      number: address.number,
      complement: address.complement ?? null,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const customerId = await addressController.getCustomerId(request.user.id);
    const data = UpdateAddressSchema.parse(request.body);

    const updateAddressUseCase = container.resolve(UpdateAddressUseCase);
    const address = await updateAddressUseCase.execute(id, customerId, data);

    return reply.send({
      id: address.id,
      street: address.street,
      number: address.number,
      complement: address.complement ?? null,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const customerId = await addressController.getCustomerId(request.user.id);

    const deleteAddressUseCase = container.resolve(DeleteAddressUseCase);
    await deleteAddressUseCase.execute(id, customerId);

    return reply.status(204).send();
  }
}

const addressController = new AddressController();
