import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRequisitoDojoDto {
  @IsString({ message: 'origem deve ser texto' })
  @IsNotEmpty({ message: 'origem é obrigatória' })
  origem!: string;

  @IsString({ message: 'indicador deve ser texto' })
  @IsNotEmpty({ message: 'indicador é obrigatório' })
  indicador!: string;

  @IsString({ message: 'parametroAfericao deve ser texto' })
  @IsNotEmpty({ message: 'parametroAfericao é obrigatório' })
  parametroAfericao!: string;

  @IsString({ message: 'formaVerificacao deve ser texto' })
  @IsNotEmpty({ message: 'formaVerificacao é obrigatória' })
  formaVerificacao!: string;

  @IsString({ message: 'frequenciaApuracao deve ser texto' })
  @IsNotEmpty({ message: 'frequenciaApuracao é obrigatória' })
  frequenciaApuracao!: string;
}
