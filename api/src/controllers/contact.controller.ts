import { httpErrors } from "@fastify/sensible";
import {
  ContactDTO,
  ContactEntity,
  ContactListDTO,
  CreateContactDTO,
  UpdateContactDTO,
} from "models/contact.model";
import { Sort } from "models/query-parts.model";
import { IContactRepository } from "repositories/contact.repository";

import { v4 as uuidv4 } from "uuid";

export interface IContactController {
  find(id: string): Promise<ContactDTO>;
  findList(
    from: string | undefined,
    to: string | undefined,
    sort: Sort | undefined,
    limit: number | undefined,
  ): Promise<ContactListDTO>;
  create(contact: CreateContactDTO): Promise<ContactDTO>;
  update(id: string, contact: UpdateContactDTO): Promise<ContactDTO>;
  delete(id: string): Promise<void>;
}

export class ContactController implements IContactController {
  private contactRepository: IContactRepository;

  constructor(contactRepository: IContactRepository) {
    this.contactRepository = contactRepository;
  }

  async find(id: string): Promise<ContactDTO> {
    const result = await this.contactRepository.fetch(id);

    if (!result) {
      throw httpErrors.notFound();
    }

    const contact: ContactDTO = {
      id: result.id,
      email: result.email,
      name: result.name,
      message: result.message,
      timestamp: result.timestamp,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    return contact;
  }

  async findList(
    from: string | undefined,
    to: string | undefined,
    sort: Sort | undefined,
    limit: number | undefined,
  ): Promise<ContactListDTO> {
    const result: ContactEntity[] = await this.contactRepository.fetchList(
      from,
      to,
      sort,
      limit,
    );

    // Entity to DTO
    const contacts: ContactListDTO = result.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.name,
      message: c.message,
      timestamp: c.timestamp,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return contacts;
  }

  async update(id: string, contact: UpdateContactDTO): Promise<ContactDTO> {
    const storedContact = await this.contactRepository.fetch(id);
    if (!storedContact) {
      throw httpErrors.notFound();
    }

    const now = new Date().toISOString();
    const updateContact: ContactEntity = {
      ...storedContact,
      ...contact,
      updatedAt: now,
    };
    const result = await this.contactRepository.update(updateContact);

    // Entity to DTO
    const updatedContact: ContactDTO = {
      id: result.id,
      email: result.email,
      name: result.name,
      message: result.message,
      timestamp: result.timestamp,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    return updatedContact;
  }

  async create(contact: CreateContactDTO): Promise<ContactDTO> {
    const now = new Date().toISOString();
    const newContact: ContactEntity = {
      id: uuidv4(),
      userID: "DUMMY_USER_ID",
      timestamp: now,
      email: contact.email,
      name: contact.name,
      message: contact.message,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.contactRepository.create(newContact);

    // Entity to DTO
    const createdContact: ContactDTO = {
      id: result.id,
      email: result.email,
      name: result.name,
      message: result.message,
      timestamp: result.timestamp,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    return createdContact;
  }

  async delete(id: string): Promise<void> {
    await this.contactRepository.delete(id);
    return;
  }
}
