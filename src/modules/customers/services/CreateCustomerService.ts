import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import { userInfo } from 'os';
import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const checkUserExists = await this.customersRepository.findByEmail(email);
    if (checkUserExists) {
      throw new AppError('Email address already used');
    }
    const user = await this.customersRepository.create({
      name,
      email,
    });
    return user;
  }
}

export default CreateCustomerService;
