import { bcryptAdapter, JwtAdapter, envs } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";
import { EmailService } from "./email.service";

//TODO Existe dependencia directa con UserModel, además de dependencia oculta de Bcrypt falta refactorizar
export class AuthService {
    //* DI
    constructor(
        private readonly jwtAdapter: JwtAdapter,
        private readonly emailService: EmailService,
        private readonly baseWebServiceUrl: string,
        // private readonly bcryptAdapter: bcryptAdapter,
        // private readonly userModel: UserModel
    ) {}

    public async registerUser(registerUserDto: RegisterUserDto) {
        const existUser = await UserModel.findOne({email: registerUserDto.email});
        if (existUser) throw CustomError.badRequest('Email already exist');
        try {
            const user = new UserModel(registerUserDto);
            
            // Encriptar la contraseña
            user.password = bcryptAdapter.hash(registerUserDto.password);
            await user.save();
            // JWT para mantener la autenticacion del usuario
            const token = await this.jwtAdapter.generateToken({id: user.id});
            if (!token) throw CustomError.internalServer('Error generating token');
            // Email de confirmación
            await this.sendEmailValidationLink(user.email);

            const {password, ...userEntity} = UserEntity.fromObject(user);
            return {
                user: userEntity,
                token: token,
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    public async loginUser(loginUserDto: LoginUserDto) {
        const user = await UserModel.findOne({email: loginUserDto.email});
        if (!user) throw CustomError.badRequest('Invalid email or password');

        try {
            const isMatching = bcryptAdapter.compare(loginUserDto.password, user.password);
            if (!isMatching) throw CustomError.badRequest('Invalid email or password');
            const {password, ...userEntity} = UserEntity.fromObject(user);
            const token = await this.jwtAdapter.generateToken({id: user.id});
            if (!token) throw CustomError.internalServer('Error generating token');
            return {
                user: userEntity,
                token: token,
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    private sendEmailValidationLink = async(email: string) => {
        const token = await this.jwtAdapter.generateToken({email});
        if (!token) throw CustomError.internalServer('Error generating token');
        const link = `${this.baseWebServiceUrl}/auth/validate-email/${token}`;
        const html = `
            <h1>Validate your email</h1>
            <p>Click on the following link to validate your email</p>
            <a href="${link}">Validate your email: ${email}</a>
        `;
        const options = {
            to: email,
            subject: 'Validate your email',
            htmlBody: html,
        }
        const isSet = await this.emailService.sendEmail(options);
        if (!isSet) throw CustomError.internalServer('Error sending email');
        
        return true;
    }

    public validateEmail = async(token: string) => {
        const payload = await this.jwtAdapter.validateToken(token);
        if(!payload) throw CustomError.unauthorized('Invalid token');

        const {email} = payload as {email: string};
        if(!email) throw CustomError.internalServer('Email not in token');

        const user = await UserModel.findOne({email});
        if(!user) throw CustomError.internalServer('Email not exists');

        user.emailValidated = true;
        await user.save();
        return true;
    }
}