import { Controller, Get } from "@nestjs/common";

@Controller('test')
export class TestController {
    @Get()
    test(): Promise<string> {
        return new Promise((res) => {
            res('test');
        });
    }
}
