import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const findProducts = await this.ormRepository.findByIds(products);
    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productIds = products.map(product => product.id);

    const findAllProducts = await this.ormRepository.find({
      id: In(productIds),
    });

    const updatedProducts = findAllProducts.map(product => {
      const findProduct = products.find(
        productfound => productfound.id === product.id,
      );
      if (findProduct) {
        if (product.quantity - findProduct.quantity < 0)
          throw new Error('Cannot update this product quantity');
        // eslint-disable-next-line no-param-reassign
        product.quantity -= findProduct.quantity;
      }
      return product;
    });

    await this.ormRepository.save(updatedProducts);
    return updatedProducts;
  }
}

export default ProductsRepository;
