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
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`directions`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `mydb`.`directions` (
  `scene_id1` INT NOT NULL ,
  `scene_id2` INT NOT NULL ,
  `id` INT NOT NULL ,
  PRIMARY KEY (`scene_id1`, `scene_id2`, `id`) ,
  INDEX `fk_directions_scene1_idx` (`scene_id2` ASC) ,
  CONSTRAINT `fk_directions_scene`
    FOREIGN KEY (`scene_id1` )
    REFERENCES `mydb`.`scene` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_directions_scene1`
    FOREIGN KEY (`scene_id2` )
    REFERENCES `mydb`.`scene` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`pano`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `mydb`.`pano` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `path` VARCHAR(45) NOT NULL ,
  `aesthetic` FLOAT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`pano_has_directions`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `mydb`.`pano_has_directions` (
  `pano_id` INT NOT NULL ,
  `directions_scene_id` INT NOT NULL ,
  `directions_scene_id1` INT NOT NULL ,
  `directions_id` INT NOT NULL ,
  PRIMARY KEY (`pano_id`, `directions_scene_id`, `directions_scene_id1`, `directions_id`) ,
  INDEX `fk_pano_has_directions_directions1_idx` (`directions_scene_id` ASC, `directions_scene_id1` ASC, `directions_id` ASC) ,
  INDEX `fk_pano_has_directions_pano1_idx` (`pano_id` ASC) ,
  CONSTRAINT `fk_pano_has_directions_pano1`
    FOREIGN KEY (`pano_id` )
    REFERENCES `mydb`.`pano` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_pano_has_directions_directions1`
    FOREIGN KEY (`directions_scene_id` , `directions_scene_id1` , `directions_id` )
    REFERENCES `mydb`.`directions` (`scene_id1` , `scene_id2` , `id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `mydb` ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
