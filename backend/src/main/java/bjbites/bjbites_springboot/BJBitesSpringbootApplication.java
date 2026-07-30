package bjbites.bjbites_springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import de.codecentric.boot.admin.server.config.EnableAdminServer;

@SpringBootApplication
@EnableScheduling
@EnableAdminServer
public class BJBitesSpringbootApplication {

	public static void main(String[] args) {
		SpringApplication.run(BJBitesSpringbootApplication.class, args);
	}

}
