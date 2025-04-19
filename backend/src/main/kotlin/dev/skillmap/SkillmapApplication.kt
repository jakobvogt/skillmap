package dev.skillmap

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class SkillmapApplication

fun main(args: Array<String>) {
	runApplication<SkillmapApplication>(*args)
}
