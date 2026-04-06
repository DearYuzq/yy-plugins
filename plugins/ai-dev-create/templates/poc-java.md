# Java/Spring Boot POC 模板

```java
package poc;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * POC: {poc-id}
 * 目标: {目标}
 * 创建时间: {timestamp}
 */
@SpringBootTest
@AutoConfigureMockMvc
public class Poc_{poc_id} {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void verify() throws Exception {
        System.out.println("[POC-{poc_id}] 开始验证...");

        mockMvc.perform(get("/api/{endpoint}"))
               .andExpect(status().isOk());

        System.out.println("[POC-{poc_id}] ✓ 通过");
    }
}
```
