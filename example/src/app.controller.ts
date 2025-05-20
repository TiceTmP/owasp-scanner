import {Controller, Get, Post, Body, Param, Put, Delete, Query, HttpStatus, HttpException} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody} from '@nestjs/swagger';

// DTOs สำหรับ Swagger
class CreateUserDto {
    name: string;
    email: string;
    password: string;
    age?: number;
}

class UpdateUserDto {
    name?: string;
    email?: string;
    age?: number;
}

class UserResponseDto {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

class ProductDto {
    id: number;
    name: string;
    price: number;
    description: string;
    inStock: boolean;
}

@ApiTags('example-api')
@Controller('api')
export class AppController {
    private users = [
        {id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date()},
        {id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date()},
    ];

    private products = [
        {id: 1, name: 'Laptop', price: 1200, description: 'Powerful laptop for developers', inStock: true},
        {id: 2, name: 'Smartphone', price: 800, description: 'Latest smartphone with great camera', inStock: true},
        {id: 3, name: 'Headphones', price: 150, description: 'Noise cancelling headphones', inStock: false},
    ];

    @Get('users')
    @ApiOperation({summary: 'Get all users'})
    @ApiResponse({status: 200, description: 'Return all users', type: [UserResponseDto]})
    @ApiQuery({name: 'limit', required: false, type: Number, description: 'Maximum number of users to return'})
    @ApiQuery({name: 'offset', required: false, type: Number, description: 'Number of users to skip'})
    getUsers(@Query('limit') limit?: number, @Query('offset') offset?: number): UserResponseDto[] {
        // มีช่องโหว่ SQL Injection ที่นี่ (เป็นตัวอย่างสำหรับ OWASP scanner)
        // ตัวอย่างเช่น ถ้ามีการต่อ SQL query โดยตรง: `SELECT * FROM users LIMIT ${limit} OFFSET ${offset}`

        let result = [...this.users];

        if (offset) {
            result = result.slice(Number(offset));
        }

        if (limit) {
            result = result.slice(0, Number(limit));
        }

        return result;
    }

    @Get('users/:id')
    @ApiOperation({summary: 'Get user by ID'})
    @ApiResponse({status: 200, description: 'Return the user', type: UserResponseDto})
    @ApiResponse({status: 404, description: 'User not found'})
    @ApiParam({name: 'id', description: 'User ID'})
    getUserById(@Param('id') id: string): UserResponseDto {
        // มีช่องโหว่ Insecure Direct Object Reference (IDOR) ที่นี่
        const user = this.users.find(u => u.id === Number(id));

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        return user;
    }

    @Post('users')
    @ApiOperation({summary: 'Create a new user'})
    @ApiResponse({status: 201, description: 'User created successfully', type: UserResponseDto})
    @ApiResponse({status: 400, description: 'Invalid input'})
    @ApiBody({type: CreateUserDto})
    createUser(@Body() createUserDto: CreateUserDto): UserResponseDto {
        // มีช่องโหว่ Missing Input Validation ที่นี่
        const newUser = {
            id: this.users.length + 1,
            name: createUserDto.name,
            email: createUserDto.email,
            createdAt: new Date(),
        };

        this.users.push(newUser);
        return newUser;
    }

    @Put('users/:id')
    @ApiOperation({summary: 'Update a user'})
    @ApiResponse({status: 200, description: 'User updated successfully', type: UserResponseDto})
    @ApiResponse({status: 404, description: 'User not found'})
    @ApiParam({name: 'id', description: 'User ID'})
    @ApiBody({type: UpdateUserDto})
    updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): UserResponseDto {
        // มีช่องโหว่ Broken Access Control ที่นี่
        const userIndex = this.users.findIndex(u => u.id === Number(id));

        if (userIndex === -1) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // อัปเดตข้อมูลของผู้ใช้
        this.users[userIndex] = {
            ...this.users[userIndex],
            ...updateUserDto,
        };

        return this.users[userIndex];
    }

    @Delete('users/:id')
    @ApiOperation({summary: 'Delete a user'})
    @ApiResponse({status: 204, description: 'User deleted successfully'})
    @ApiResponse({status: 404, description: 'User not found'})
    @ApiParam({name: 'id', description: 'User ID'})
    deleteUser(@Param('id') id: string): void {
        // มีช่องโหว่ Mass Assignment ที่นี่
        const userIndex = this.users.findIndex(u => u.id === Number(id));

        if (userIndex === -1) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        this.users.splice(userIndex, 1);
    }

    @Get('products')
    @ApiOperation({summary: 'Get all products'})
    @ApiResponse({status: 200, description: 'Return all products', type: [ProductDto]})
    getProducts(): ProductDto[] {
        // มีช่องโหว่ Information Disclosure ที่นี่ (เปิดเผยข้อมูลเกินความจำเป็น)
        return this.products;
    }

    @Get('products/:id')
    @ApiOperation({summary: 'Get product by ID'})
    @ApiResponse({status: 200, description: 'Return the product', type: ProductDto})
    @ApiResponse({status: 404, description: 'Product not found'})
    @ApiParam({name: 'id', description: 'Product ID'})
    getProductById(@Param('id') id: string): ProductDto {
        // มีช่องโหว่ Cross-site Scripting (XSS) ที่นี่
        const product = this.products.find(p => p.id === Number(id));

        if (!product) {
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }

        return product;
    }
}