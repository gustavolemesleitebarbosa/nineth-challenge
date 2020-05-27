import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (customer) {
      const areAllValidproducts = await this.productsRepository.findAllById(
        products,
      );
      if (areAllValidproducts.length !== products.length) {
        throw new AppError('Some products are no avaiable', 400);
      }

      const findProducts = await this.productsRepository
        .updateQuantity(products)
        .then(updatedProducts => {
          return updatedProducts.map(updatedProduct => {
            const search = products.find(
              product => product.id === updatedProduct.id,
            );
            if (search?.quantity)
              return {
                product_id: updatedProduct.id,
                price: updatedProduct.price,
                quantity: search.quantity,
              };
            throw new AppError(
              'unable to update this product quantitires',
              400,
            );
          });
        })
        .catch(err => {
          throw new AppError('unable to update this product quantitires', 400);
        });

      const order = await this.ordersRepository.create({
        customer,
        products: findProducts,
      });

      console.log('order', order);

      return order;
    }

    throw new AppError('this customer does not exist', 400);
  }
}

export default CreateOrderService;
