package bjbites.bjbites_springboot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * S3 client used for storing event photos. Credentials come from the default
 * provider chain, which means the task role on Fargate and the local AWS
 * profile when running on a developer machine.
 */
@Configuration
public class S3Config {

    @Value("${app.aws-region:us-east-2}")
    private String awsRegion;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(awsRegion))
                .build();
    }
}
