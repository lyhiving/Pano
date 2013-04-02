SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `mydb` ;
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`scene`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `mydb`.`scene` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(45) NOT NULL ,
  `lat` DOUBLE NOT NULL ,
  `lng` DOUBLE NOT NULL ,
  `pano` VARCHAR(45) NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`direction`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `mydb`.`direction` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `length` VARCHAR(45) NOT NULL ,
  `scene_id` INT NOT NULL ,
  `scene_id1` INT NOT NULL ,
  PRIMARY KEY (`id`, `scene_id`, `scene_id1`) ,
  INDEX `fk_direction_scene1_idx` (`scene_id` ASC) ,
  INDEX `fk_direction_scene2_idx` (`scene_id1` ASC) ,
  CONSTRAINT `fk_direction_scene1`
    FOREIGN KEY (`scene_id` )
    REFERENCES `mydb`.`scene` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_direction_scene2`
    FOREIGN KEY (`scene_id1` )
    REFERENCES `mydb`.`scene` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `mydb` ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
